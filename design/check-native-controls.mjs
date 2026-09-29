// Local replay of captured MP HTML/CSS. No outbound requests or account state.
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { build } from 'esbuild';
const source = `import {createMountainProjectApplication} from './src/application/mountain-project-application';import {NavigationControls} from './src/ui/navigation-controls';window.reviewApp=createMountainProjectApplication({id:'review-unavailable',availability:async()=> 'unavailable',translate:async()=>'',destroy(){}});window.reviewNav=new NavigationControls();window.reviewNav.mount(async(on)=>{on?window.reviewApp.enable():window.reviewApp.disable();window.reviewNav.render(on)});window.reviewApp.enable();window.reviewNav.render(true);`;
const built = await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
const html=(await readFile('/tmp/mpkr-area.html','utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const css=(await Promise.all(['/tmp/mp-site-climb.css','/tmp/mp-shared-all.css','/tmp/mp-vendor.css'].map(p=>readFile(p,'utf8')))).join('\n');
const font=await readFile('/mnt/c/Windows/Fonts/malgun.ttf');
const profile=await mkdtemp('/tmp/mpkr-native-controls-');
const browser=spawn('/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--no-first-run','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='',socket;browser.stderr.on('data',d=>stderr+=d);
const results=[];
try {
 for(let i=0;i<80&&!stderr.includes('DevTools listening');i++) await delay(100);
 const endpoint=stderr.match(/DevTools listening on (ws:\/\/\S+)/)?.[1];if(!endpoint)throw Error(stderr);
 const targets=await(await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
 let sequence=0;const pending=new Map();
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(Error(method+' timeout')),20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',async e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}
  if(m.method==='Fetch.requestPaused'){
   const {requestId,request,resourceType}=m.params;
   const path=new URL(request.url).pathname;
   let body='',type='text/plain',status=200;
   if(resourceType==='Document'&&path==='/area/106225629/south-korea') {body=html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,'').replace('</head>',`<style>${css}</style><style>@font-face{font-family:ReviewKorean;src:url('/__review-font.ttf')}body{font-family:ReviewKorean,Arial,sans-serif}</style></head>`);type='text/html';}
   else if(path==='/__review-font.ttf'){body=font;type='font/ttf';}
   else if(resourceType==='Image'){body=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');type='image/png';}
   else {status=404;}
   await cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')}).catch(()=>{});
  }
 });
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
 for(const width of [1440,390]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'https://www.mountainproject.com/area/106225629/south-korea'});await delay(700);await evaluate('document.fonts.ready.then(()=>true)');
  const before=await evaluate('({overflow:document.documentElement.scrollWidth-innerWidth,bodyWidth:document.body.getBoundingClientRect().width})');
  await evaluate(built.outputFiles[0].text);await delay(250);
  const after=await evaluate(`({overflow:document.documentElement.scrollWidth-innerWidth,bodyWidth:document.body.getBoundingClientRect().width,extraIcons:document.querySelectorAll('[data-mpkr-icon]').length,controlLabels:[...document.querySelectorAll('.mpkr-translation-notice button,.mpkr-directory-load,.mpkr-south-korea-map__external')].map(e=>e.textContent.trim()),controlsWithSvg:document.querySelectorAll('.mpkr-translation-notice svg,.mpkr-directory svg,.mpkr-south-korea-map svg').length,headings:document.querySelectorAll('.mpkr-area-section-heading').length})`);
  const shot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(`design/review/minimal-controls-native-${width}.png`,Buffer.from(shot.data,'base64'));
  await evaluate('window.reviewApp.disable();window.reviewNav.destroy();true');await delay(100);
  const restored=await evaluate('({overflow:document.documentElement.scrollWidth-innerWidth,bodyWidth:document.body.getBoundingClientRect().width,controls:document.querySelectorAll(".mpkr-translation-notice,.mpkr-directory,[data-mpkr-area-route-finish]").length})');
  const passed=after.extraIcons===0&&after.controlsWithSvg===0&&after.overflow<=before.overflow&&restored.controls===0&&restored.bodyWidth===before.bodyWidth;
  results.push({width,before,after,restored,passed});
 }
 await writeFile('design/review/minimal-controls-native-check.json',JSON.stringify({scope:'Captured South Korea HTML and native CSS; scripts disabled, image placeholders, no outbound network; actual application and navigation source',results},null,2));
 console.log(JSON.stringify(results));if(results.some(r=>!r.passed))process.exitCode=1;
} finally {socket?.close();browser.kill();}
