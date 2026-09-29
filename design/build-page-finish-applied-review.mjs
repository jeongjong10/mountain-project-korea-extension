import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
const source = `
import {AreaRoutePageFinish} from './src/ui/area-route-page-finish';
import {AreaPageSectionPresentation,RoutePageSectionPresentation} from './src/ui/area-page-section-presentation';
import {RouteListPresentation} from './src/ui/route-list-presentation';
import {OriginalPreservingRenderer} from './src/rendering/original-preserving-renderer';
const finish = new AreaRoutePageFinish();
const sections = document.querySelector('#route-page') ? new RoutePageSectionPresentation() : new AreaPageSectionPresentation();
const lists = new RouteListPresentation();
const renderer = new OriginalPreservingRenderer();
for (const [index, source] of [...document.querySelectorAll('[data-original]')].entries()) {
 renderer.render({id:'review-'+index,category:'description',source:source.textContent,sourceElements:[source],parent:source.parentElement},source.dataset.translation);
}
renderer.setRetranslateHandler(async()=> 'unchanged');
sections.mount(); lists.mount(); finish.mount();
for(const h of document.querySelectorAll('.mpkr-area-section-heading')) h.click();
window.checkReview = () => {
 const h=document.querySelector('.mpkr-area-section-heading'),body=document.getElementById(h.getAttribute('aria-controls'));
 h.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 const collapsed=body.hidden&&h.getAttribute('aria-expanded')==='false';
 h.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));
 const expanded=!body.hidden&&h.getAttribute('aria-expanded')==='true';
 const action=document.querySelector('.mpkr-original-toggle');
 const original=document.querySelector('[data-original]');
 let originalToggle=null;
 if(action){action.click();const shown=getComputedStyle(original).display!=='none';action.click();originalToggle=shown&&getComputedStyle(original).display==='none';}
 const title=document.querySelector('h1');
 const activeLineHeight=getComputedStyle(title).lineHeight;
 finish.destroy();const removed=!document.querySelector('[data-mpkr-area-route-finish]');
 const restoredLineHeight=getComputedStyle(title).lineHeight;
 finish.mount();finish.mount();
 const singleStyle=document.querySelectorAll('[data-mpkr-area-route-finish]').length===1;
 let firstRowTextOffset=0;
 const firstLink=document.querySelector('.mpkr-route-list-primary'),grade=document.querySelector('.route-row .rateYDS');
 if(firstLink&&grade){const range=document.createRange();range.selectNodeContents(firstLink);firstRowTextOffset=range.getBoundingClientRect().bottom-grade.getBoundingClientRect().bottom;}

 const sectionMargin=getComputedStyle(h).marginTop;
 return {sectionMargin,collapsed,expanded,originalToggle,removed,singleStyle,activeLineHeight,restoredLineHeight,
  firstRowTextOffset,overflow:document.documentElement.scrollWidth-innerWidth,
  overflowingControls:[...document.querySelectorAll('.mpkr-area-section-heading,.mpkr-translation-actions,.mpkr-route-list-primary')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length,
  passed:sectionMargin==='24px'&&Math.abs(firstRowTextOffset)<=1&&collapsed&&expanded&&originalToggle!==false&&removed&&singleStyle&&document.documentElement.scrollWidth<=innerWidth};
};
`;
const bundle=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
const section=(title,text)=>`<section><h2 class="mt-2">${title}</h2><div class="fr-view"><p data-original data-translation="${text}">Original example paragraph kept in its native position.</p></div></section>`;
const area=`<div class="crumb">대한민국 › 서울·경기도</div><h1>북한산 · 인수봉</h1><p class="meta">지역 정보 · 등반 루트</p>${section('설명','지역 소개와 접근 정보가 긴 한글 문장으로 이어져도 편하게 읽을 수 있도록 줄 간격과 문단 간격을 맞췄습니다.')}<h2>클래식 루트</h2><table class="route-table"><tr class="screen-reader-only"><th>루트 이름</th><th>난이도</th></tr><tr class="route-row"><td><a href="/route/1/example-a">예시 루트 A</a></td><td><span class="rateYDS">5.8</span></td></tr><tr class="route-row"><td><a href="/route/2/example-b"><span class="text-truncate">이름이 긴 예시 루트도 두 줄로 자연스럽게 표시</span></a></td><td><span class="rateYDS">5.10a</span></td></tr><tr class="route-row"><td><a href="/route/3/example-c">ExampleWithAnExtremelyLongUnbrokenRouteNameForLayoutReview</a></td><td><span class="rateYDS">5.11b</span></td></tr></table>`;
const route=`<div class="crumb">대한민국 › 북한산 › 인수봉</div><h1>긴 한글 이름도 읽기 편하게 이어지는 예시 루트</h1><p class="meta">5.10a · 트래드 · 3 피치</p>${section('설명','제목과 본문, 원문 보기·재번역 버튼의 간격을 맞췄습니다. 버튼은 관련 설명 바로 아래에 모읍니다.')}${section('위치','접근 정보에도 같은 줄 간격을 적용합니다. 긴 문장이 좁은 화면에서도 밖으로 넘치지 않는지 확인합니다.')}`;
const nativeCSS=`@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}*{box-sizing:border-box}body{margin:0;padding:22px;background:white;color:#202124;font:16px/1.5 ReviewKorean,system-ui}h1{font-size:24px;line-height:1.2;margin:8px 0 10px}h2{font-size:16px;margin:24px 0 8px}p{margin:0 0 16px}.crumb,.meta{font-size:12px;color:#59635d}.mt-2{margin-top:32px!important}.mb-1{margin-bottom:16px!important}table{border-collapse:collapse;width:100%}td{font-size:14px;padding:4px}td:last-child{width:1%;text-align:right}.text-truncate{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}a{color:#0060a9;text-decoration:none}.screen-reader-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.mpkr-translation-actions button{font-family:ReviewKorean,system-ui!important}`;
const doc=(id,body)=>`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://www.mountainproject.com/"><style>${nativeCSS}</style><main id="${id}">${body}</main><script>${bundle.outputFiles[0].text}</script></html>`;
const escape= s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
await writeFile('design/review/page-finish-applied.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}*{box-sizing:border-box}body{margin:0;padding:28px 32px;background:#f7f8f8;color:#202124;font:14px/1.65 ReviewKorean,system-ui}h1{font-size:23px;margin:0 0 10px}.intro,.note{font-size:13px;color:#59635d}.examples{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}.label{font-size:12px;color:#59635d;margin-bottom:9px}iframe{display:block;width:100%;height:800px;background:white;border:1px solid #c8ceca;border-radius:7px}.note{margin-top:22px}@media(max-width:700px){body{padding:20px}.examples{grid-template-columns:1fr}}</style><h1>지역·루트 페이지 · 실제 소스 적용 확인</h1><p class="intro">제목·본문 간격, 긴 이름의 줄바꿈, 루트 목록의 행 간격을 정리했습니다.<br>접기·펼치기와 원문 전환은 실제 제품 코드를 사용합니다.</p><main class="examples"><section><div class="label">Area · 지역 페이지</div><iframe title="지역 예시" srcdoc="${escape(doc('climb-area-page',area))}"></iframe></section><section><div class="label">Route · 루트 페이지</div><iframe title="루트 예시" srcdoc="${escape(doc('route-page',route))}"></iframe></section></main><p class="note">원본 페이지 구조를 본뜬 검토용 예시입니다. 실제 사이트 화면 캡처나 등반 정보가 아닙니다.<br>글꼴·제목 크기는 MP 원본을 상속하며, 이번 단계에서는 지역·루트 화면의 간격과 줄바꿈을 적용했습니다.</p><script>window.checkReview=()=>[...document.querySelectorAll('iframe')].map(f=>({title:f.title,...f.contentWindow.checkReview()}));</script></html>`);
console.log('Wrote applied Area/Route review');
