import { writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
const bundle=await build({stdin:{contents:`
import {NavigationControls} from './src/ui/navigation-controls';
import {OriginalPreservingRenderer} from './src/rendering/original-preserving-renderer';
if(window.reviewCase==='nav'){
 const controls=new NavigationControls();controls.mount(async()=>{throw Error('simulated storage failure')});controls.render(true);document.querySelector('input').click();
}else{
 const renderer=new OriginalPreservingRenderer();const source=document.querySelector('#source');const target={id:'review-description',category:'description',source:source.textContent,sourceElements:[source],parent:source.parentElement,insertBefore:source.nextSibling};
 if(window.reviewCase==='same'){renderer.setRetranslateHandler(async()=> 'unchanged');renderer.render(target,'이 루트는 크랙을 따라 작은 선반까지 이어집니다.');document.querySelector('.mpkr-retranslate').click()}
 else renderer.showFailure(target,'원문 형식을 보호하기 위해 번역을 보류했습니다. 원문은 그대로 유지됩니다. 재번역으로 다시 시도할 수 있습니다.');
}
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const frame=(kind)=>{
 const content=kind==='nav'?'<div id="header-container"><div class="header-container__user"><div id="user"><a href="#">Sign In</a></div></div></div>':'<div class="fr-view"><p id="source">The route follows the crack to a small ledge.</p></div>';
 const doc=`<!doctype html><html lang="ko"><meta charset="utf-8"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{margin:0;padding:16px;font:13px/1.7 ReviewKorean,system-ui;background:white}.mpkr-status-message,.mpkr-translation-actions button,.mpkr-translation-feedback{font-family:ReviewKorean,system-ui!important}#source{font-family:Georgia,serif}#user{font-size:12px}#user a{color:#0060a9}</style>${content}<script>window.reviewCase=${JSON.stringify(kind)};${bundle.outputFiles[0].text}</script></html>`;
 return `<iframe title="${kind}" srcdoc="${escape(doc)}"></iframe>`;
};
await writeFile('design/review/message-applied.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{margin:0;padding:26px 32px;background:#f7f8f8;color:#202124;font:13px/1.8 ReviewKorean,system-ui}h1{font-size:23px;margin:0 0 8px}h2{font-size:12px;font-weight:500;color:#59635d;margin:18px 0 8px}iframe{display:block;box-sizing:border-box;width:100%;height:240px;border:1px solid #c8ceca;border-radius:7px}.note{color:#59635d}@media(max-width:600px){body{padding:20px}iframe{height:300px}}</style><h1>기존 오류·상태 표시 · 적용 결과</h1><p>실제 상단 바와 본문 렌더러를 사용한 검토 화면입니다.</p><h2>설정 저장 실패</h2>${frame('nav')}<h2>재번역 결과 동일</h2>${frame('same')}<h2>원문 형식 보호</h2>${frame('protected')}<p class="note">오류와 결과를 모의 입력했습니다. 확장 설정이나 실제 페이지 내용은 변경하지 않습니다.</p></html>`);
console.log('Wrote message applied review');
