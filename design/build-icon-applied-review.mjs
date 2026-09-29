import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
const source=`
import {setIconLabel,appendExternalIcon} from './design/archived-control-icons';
import {OriginalPreservingRenderer} from './src/rendering/original-preserving-renderer';
import {AreaPageSectionPresentation} from './src/ui/area-page-section-presentation';
const renderer=new OriginalPreservingRenderer();const source=document.querySelector('#source');renderer.render({id:'demo',category:'description',source:source.textContent,sourceElements:[source],parent:source.parentElement},'한국어 본문과 원문을 같은 위치에서 전환합니다.');renderer.setRetranslateHandler(async()=> 'unchanged');
const sections=new AreaPageSectionPresentation();sections.mount();
document.querySelectorAll('a.external').forEach(appendExternalIcon);
setIconLabel(document.querySelector('#prepare'),'prepare','번역 준비 시작');
setIconLabel(document.querySelector('#retry'),'retry','다시 시도');
`;
const bundle=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
await writeFile('design/review/icon-applied.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}body{margin:0;padding:28px 32px;background:#f7f8f8;color:#202124;font:14px/1.65 ReviewKorean,system-ui}h1{font-size:23px;margin:0 0 8px}h2{font-size:16px;margin:12px 0}.intro,.note{font-size:13px;color:#59635d}.card{border:1px solid #c8ceca;border-radius:7px;background:white;padding:20px;margin-top:20px}.external{display:inline-block;color:#0060a9;font-size:13px;text-decoration:none;margin:8px 24px 8px 0}button{background:white;color:#0060a9;border:1px solid #c8ceca;border-radius:4px;padding:7px 10px;font:600 12px/1.5 ReviewKorean,system-ui;margin-right:8px}.mpkr-translation-actions button{font-family:ReviewKorean,system-ui!important}.note{margin-top:22px}#climb-area-page .fr-view{padding:8px 0}#climb-area-page h2{border-bottom:1px solid #c8ceca;padding-bottom:10px}</style><h1>보조 아이콘 · 실제 적용</h1><p class="intro">공통 SVG와 실제 본문 렌더러·섹션 컨트롤을 사용했습니다.</p><div class="card"><div class="fr-view"><p id="source">Original text remains available.</p></div></div><div class="card" id="climb-area-page"><h2>설명</h2><div class="fr-view"><p>제목을 눌러 본문을 펼치거나 접을 수 있습니다.</p></div></div><div class="card"><a class="external" href="#">Mountain Project 원본 지도 열기</a><a class="external" href="#">사용 안내</a><p><button id="prepare"></button><button id="retry"></button></p></div><p class="note">SVG는 16px이며 스크린리더는 기존 한글 이름을 읽습니다.<br>이 검토 화면의 재번역 결과는 모의 응답입니다.</p><script>${bundle.outputFiles[0].text}</script></html>`);
console.log('Wrote actual-source icon review');
