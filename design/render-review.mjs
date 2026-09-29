import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
const repo=process.cwd();
const profile=await mkdtemp('/tmp/mpkr-design-chrome-');
const browser=spawn('/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',['--headless','--no-sandbox','--disable-gpu','--disable-background-networking','--no-first-run','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='',ws; browser.stderr.on('data',d=>stderr+=d);
try {
 for(let i=0;i<80&&!stderr.includes('DevTools listening');i++){if(browser.exitCode!==null||browser.signalCode!==null)throw new Error(stderr);await delay(100);}
 const endpoint=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];if(!endpoint)throw new Error(stderr);
 const targets=await(await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true});});
 let id=0;const pending=new Map();
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const rid=++id;const timer=setTimeout(()=>{pending.delete(rid);reject(new Error(`CDP timeout ${method}`));},20000);pending.set(rid,{resolve,reject,timer});ws.send(JSON.stringify({id:rid,method,params}));});
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data),t=pending.get(m.id);if(t){clearTimeout(t.timer);pending.delete(m.id);m.error?t.reject(new Error(JSON.stringify(m.error))):t.resolve(m.result);}});
 const evaluate=async(expression)=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 if(process.argv[2]==='icons'){
  const src=`data:image/png;base64,${(await readFile(`${repo}/design/mp-korea-icon-master.png`)).toString('base64')}`;
  for(const size of [16,32,48,128]){
   const png=await evaluate(`(async()=>{const i=new Image();i.src=${JSON.stringify(src)};await i.decode();const c=document.createElement('canvas');c.width=c.height=${size};const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(i,0,0,${size},${size});return c.toDataURL('image/png').split(',')[1]})()`);
   await writeFile(`${repo}/public/icon/${size}.png`,Buffer.from(png,'base64'));
  }
  console.log('Exported icon PNGs: 16, 32, 48, 128');
 } else {
  const file=process.argv[2],out=process.argv[3],width=Number(process.argv[4]||960),height=Number(process.argv[5]||760);
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:pathToFileURL(file).href});
  await delay(600);await evaluate('Promise.all([document.fonts.ready,...[...document.querySelectorAll("iframe")].map(f=>f.contentDocument.fonts.ready)]).then(()=>true)');await delay(150);
  const report=await evaluate(`({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,invalidImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,frames:[...document.querySelectorAll("iframe")].map(f=>({overflowX:f.contentDocument.documentElement.scrollWidth-f.clientWidth,overflowY:f.contentDocument.documentElement.scrollHeight-f.clientHeight,fonts:f.contentDocument.fonts.status,controls:f.contentDocument.querySelectorAll(".mp-nav-control").length,text:f.contentDocument.querySelector(".mp-nav-copy")?.textContent}))})`);
  const checks=await evaluate('typeof window.checkReview === "function" ? window.checkReview() : null');
  const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out,Buffer.from(shot.data,'base64'));console.log(JSON.stringify({out,...report,...(checks ? {checks} : {})}));
 }
}finally{ws?.close();browser.kill();}
