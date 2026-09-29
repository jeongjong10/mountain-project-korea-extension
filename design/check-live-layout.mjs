import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdtemp,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
const out=process.argv[3]??'design/review/2026-09-29';await mkdir(out,{recursive:true});
const content=await readFile('.output/chrome-mv3/content-scripts/content.js','utf8');
const profile=await mkdtemp('/tmp/mpkr-live-layout-');
const browser=spawn('/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--no-first-run','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='',socket;browser.stderr.on('data',d=>stderr+=d);
const results={date:new Date().toISOString(),contentSha256:createHash('sha256').update(content).digest('hex'),mode:'Live public MP pages in clean Chromium; exact emitted content script with in-memory extension storage; not the user profile or installed extension. Parent-frame injection only.',pages:[],errors:[],blockedWrites:0};
try{
 for(let i=0;i<80&&!stderr.includes('DevTools listening');i++){if(browser.exitCode!==null)throw Error(stderr);await delay(100);}
 const endpoint=stderr.match(/DevTools listening on (ws:\/\/\S+)/)?.[1];if(!endpoint)throw Error(stderr);
 const targets=await(await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
 let sequence=0;const pending=new Map();
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'))},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}
 if(m.method==='Fetch.requestPaused'){const p=m.params,allow=p.request.method==='GET'||p.request.method==='HEAD';if(!allow)results.blockedWrites++;void cdp(allow?'Fetch.continueRequest':'Fetch.failRequest',{requestId:p.requestId,...(allow?{}:{errorReason:'BlockedByClient'})}).catch(()=>{});}
 if(m.method==='Runtime.exceptionThrown')results.errors.push({text:m.params.exceptionDetails.text,description:m.params.exceptionDetails.exception?.description?.slice(0,350)});
 });
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*'}]});
 results.browser=await cdp('Browser.getVersion');
 const metrics=`(()=>{const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]')};const selected=[...document.querySelectorAll('#header,.main-content,.mpkr-directory,.mpkr-area-section-heading,.mpkr-translation-notice,.mpkr-translation-actions,.mpkr-south-korea-map__heading,.mpkr-route-stats-embed__heading')].filter(visible);return {url:location.href,title:document.title,kind:document.documentElement.dataset.mpKoreaPageKind,core:document.documentElement.dataset.mpKoreaCore,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),extraIcons:document.querySelectorAll('[data-mpkr-icon]').length,overflows:selected.filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+2||e.getBoundingClientRect().left< -2).map(e=>({tag:e.tagName,id:e.id,className:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),outside:[...document.querySelectorAll('body *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.right>document.documentElement.clientWidth+2&&getComputedStyle(e).position!=='fixed'}).slice(-35).map(e=>({tag:e.tagName,id:e.id,className:typeof e.className==='string'?e.className:'svg',x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right,y:e.getBoundingClientRect().y,width:e.getBoundingClientRect().width,cssOverflow:getComputedStyle(e).overflowX,html:e.outerHTML.slice(0,500)})),main:document.querySelector('.main-content')?.getBoundingClientRect().toJSON(),headings:[...document.querySelectorAll('.mpkr-area-section-heading')].map(e=>({text:e.textContent,expanded:e.getAttribute('aria-expanded')})),styles:document.styleSheets.length,images:[...document.images].filter(i=>i.complete&&i.naturalWidth).length}})()`;
 const injection=`(()=>{const listeners=new Set();let enabled=true;const browser={runtime:{id:'mpkr-live-layout-review'},storage:{local:{get:async()=>({enabled}),set:async values=>window.__mpkrSetEnabled(values.enabled)},onChanged:{addListener:f=>listeners.add(f),removeListener:f=>listeners.delete(f)}}};window.__mpkrSetEnabled=next=>{const oldValue=enabled;enabled=next;for(const f of [...listeners])f({enabled:{oldValue,newValue:next}},'local')};window.chrome=browser;window.browser=browser;})()`;
 const cases=[['area','/area/106225629/south-korea'],['route','/route/106232568/chouinard-b'],['main','/'],['directory','/route-guide']];
 for(const [kind,path] of cases.filter(c=>!process.argv[2]||c[0]===process.argv[2])){
  const row={kind,url:'https://www.mountainproject.com'+path,widths:[]};results.pages.push(row);
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:row.url});
  for(let i=0;i<60;i++){await delay(250);const ready=await evaluate('document.readyState!=="loading" && Boolean(document.querySelector("#header"))');if(ready)break;}
  await delay(1000);
  row.native=await evaluate(metrics);
  if(!await evaluate('Boolean(document.querySelector("#header"))')){row.blocked=await evaluate('document.body?.innerText.slice(0,300)');console.log(JSON.stringify(row));continue;}
  await evaluate(injection);await evaluate(content);await delay(800);
  for(const width of [1440,1024,768,390]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});await evaluate('window.scrollTo(0,0)');await delay(350);
   const data={width,on:await evaluate(metrics)};
   if(width===1440||width===390){const shot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(`${out}/${kind}-${width}-on.png`,Buffer.from(shot.data,'base64'));}
   if(kind==='area'||kind==='route'){
    data.fold=await evaluate(`(()=>{const h=document.querySelector('.mpkr-area-section-heading');if(!h)return null;h.click();const body=document.getElementById(h.getAttribute('aria-controls'));const opened=!body.hidden;h.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return {opened,closed:body.hidden}})()`);
   }
   await evaluate('window.__mpkrSetEnabled(false)');await delay(180);data.off=await evaluate(metrics);
   await evaluate('window.__mpkrSetEnabled(true)');await delay(200);data.remount=await evaluate(metrics);
   row.widths.push(data);
  }
  console.log(JSON.stringify({kind,checks:row.widths.map(r=>({width:r.width,onOverflow:r.on.overflow,offOverflow:r.off.overflow,overflows:r.on.overflows,fold:r.fold,core:r.on.core}))}));
  await writeFile(`${out}/live-layout.json`,JSON.stringify(results,null,2));
 }
}catch(e){results.fatal=String(e);process.exitCode=1;console.log(String(e));}
finally{await writeFile(`${out}/live-layout.json`,JSON.stringify(results,null,2));socket?.close();browser.kill();}
