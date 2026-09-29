import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const bundle = await build({
  entryPoints: ['src/entrypoints/popup/main.ts'], bundle: true, write: false, format: 'iife',
  plugins: [{name: 'local-review-storage', setup(b) {
    b.onResolve({filter: /^wxt\/browser$/}, () => ({path: 'browser', namespace: 'review'}));
    b.onLoad({filter: /.*/, namespace: 'review'}, () => ({contents: `
      const listeners = new Set(); let value = window.reviewEnabled;
      export const browser = {runtime:{getManifest:()=>({version:${JSON.stringify(version)}})},storage:{
        local:{get:async()=>({enabled:value}),set:async(next)=>{value=next.enabled;listeners.forEach(fn=>fn({enabled:{newValue:value}},'local'))}},
        onChanged:{addListener:fn=>listeners.add(fn),removeListener:fn=>listeners.delete(fn)}
      }};`, loader: 'js'}));
  }}],
});
const html = await readFile('src/entrypoints/popup/index.html', 'utf8');
const css = await readFile('src/entrypoints/popup/style.css', 'utf8');
const icon = `data:image/png;base64,${(await readFile('public/icon/128.png')).toString('base64')}`;
const font = `@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{font-family:ReviewKorean,system-ui,sans-serif}`;
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const frame = enabled => {
  const doc = html.replace('<link rel="stylesheet" href="./style.css" />',`<style>${css}${font}</style>`)
    .replace('/icon/128.png',icon).replace('<script type="module" src="./main.ts"></script>',`<script>window.reviewEnabled=${enabled};${bundle.outputFiles[0].text}</script>`);
  return `<section><p>확장 기능 ${enabled?'켜짐':'꺼짐'}</p><iframe title="${enabled?'켜짐':'꺼짐'} 팝업" srcdoc="${escape(doc)}"></iframe></section>`;
};
await writeFile('design/review/popup-applied.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><style>${font}*{box-sizing:border-box}body{margin:0;padding:32px 36px;background:#f7f8f8;color:#202124;font:13px ReviewKorean,system-ui}h1{font-size:23px;margin:8px 0 12px}.eyebrow{color:#0060a9;font-weight:bold;letter-spacing:1px;font-size:11px}.intro,p{color:#59635d;line-height:1.8}.examples{display:flex;gap:28px;margin:20px 0}iframe{display:block;width:334px;height:318px;border:1px solid #5f6368;border-radius:7px}.note{line-height:1.8}</style><div class="eyebrow">MP KOREA · 03</div><h1>팝업 · 다크 디자인 적용</h1><div class="intro">승인한 디자인을 실제 팝업에 반영했습니다.</div><div class="examples">${frame(true)}${frame(false)}</div><div class="note">제품의 HTML·CSS·스크립트로 렌더링했습니다.<br>이 검토 화면의 저장소는 로컬 모의 저장소입니다.</div></html>`);
console.log('Wrote actual-source popup review');
