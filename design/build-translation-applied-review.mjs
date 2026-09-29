import { writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
const source = `
import {PageTranslationController} from './src/localization/page-translation-controller';
import {TranslationLedger} from './src/core/translation-record';
import {MountainProjectPageAdapter} from './src/sites/mountain-project/dom/page-adapter';
import {OriginalPreservingRenderer} from './src/rendering/original-preserving-renderer';
import {TranslationNotice} from './src/ui/translation-notice';
const provider={id:'local-review',availability:async()=>window.reviewState==='unsupported'?'unavailable':'downloadable',translate:async()=>{if(window.reviewState==='failed')throw Error('simulated failure');return new Promise(()=>{})}};
const view=new TranslationNotice(()=>controller.retry());
const controller=new PageTranslationController(provider,new TranslationLedger(),new MountainProjectPageAdapter(),new OriginalPreservingRenderer(),{onNoticeChange:state=>view.render(state)});
controller.start().then(async()=>{if(['preparing','failed'].includes(window.reviewState))void controller.retry()});
`;
const compiled=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const states=[['waiting','준비 시작'],['preparing','준비 중'],['unsupported','본문 번역 미지원'],['failed','실패·재시도']];
const frames=states.map(([state,label])=>{
 const doc=`<!doctype html><html lang="ko"><meta charset="utf-8"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{margin:0;padding:16px;font:13px ReviewKorean,system-ui;background:white}h2{font-size:17px;margin:0}p{font:13px/1.7 Georgia,serif}.mpkr-translation-notice{font-family:ReviewKorean,system-ui!important}</style><section><h2>Description</h2><div class="fr-view"><p>The route follows the crack to a small ledge.</p></div></section><script>window.reviewState=${JSON.stringify(state)};${compiled.outputFiles[0].text}</script></html>`;
 return `<section><p>${label}</p><iframe title="${label}" srcdoc="${escape(doc)}"></iframe></section>`;
}).join('');
await writeFile('design/review/translation-state-applied.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{margin:0;padding:28px 32px;background:#f7f8f8;color:#202124;font:13px/1.8 ReviewKorean,system-ui}h1{font-size:23px;margin:4px 0 8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px}iframe{box-sizing:border-box;width:100%;height:330px;border:1px solid #c8ceca;border-radius:7px;background:white}section p{margin:12px 0 8px;color:#59635d}.note{color:#59635d}@media(max-width:700px){body{padding:20px}.grid{grid-template-columns:1fr}}</style><h1>번역 상태 안내 · 적용 결과</h1><p>실제 컨트롤러와 안내 UI를 모의 번역 엔진에 연결한 검토 화면입니다.</p><main class="grid">${frames}</main><p class="note">정상 번역에서는 안내가 나타나지 않습니다. 실제 사이트·브라우저 언어팩 실행 화면은 아닙니다.</p></html>`);
console.log('Wrote actual-source translation state review');
