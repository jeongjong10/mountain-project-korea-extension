import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
const script=`
import {RegionDirectory} from './src/ui/region-directory';
import {SouthKoreaGateway} from './src/ui/south-korea-gateway';
import {setIconLabel} from './design/archived-control-icons';
new SouthKoreaGateway(()=>{}).mount();
new RegionDirectory().mount();
for(const panel of document.querySelectorAll('.mpkr-directory-countries')) {
 [...panel.children].slice(3).forEach(e=>e.remove());
 [...panel.querySelectorAll('[data-source-url]')].forEach((e,i)=>{e.textContent=[1248,326,214,98,310,205,95,980,146,77,31,160][i%12].toLocaleString('en-US');});
}
document.querySelector('.mpkr-directory-load').addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();},true);
setIconLabel(document.querySelector('#loading'),'prepare','불러오는 중…');
setIconLabel(document.querySelector('#partial'),'prepare','미조회 수 다시 불러오기');
const style=document.createElement('style');style.textContent=document.querySelector('#proposal-css').textContent;document.head.append(style);
`;
const bundle=await build({stdin:{contents:script,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
await writeFile('design/review/directory-finish-proposal.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}*{box-sizing:border-box}body{margin:0;padding:28px 32px;background:#f7f8f8;color:#202124;font:14px/1.65 ReviewKorean,system-ui}h1{font-size:23px;margin:0 0 10px}h2{font-size:18px}h3{font-size:14px;font-weight:400}.intro,.note{font-size:13px;color:#59635d}.label{font-size:12px;color:#59635d;margin:22px 0 8px}.card{background:white;border:1px solid #c8ceca;border-radius:7px;padding:22px}a{color:#0060a9;text-decoration:none}.text-center{text-align:center}.gateway{min-height:140px;padding:20px}.gateway h1{font-size:26px}.text-truncate{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.float-xs-left{float:left}.float-xs-right{float:right}.clearfix:after{content:'';display:table;clear:both}.ml-half{margin-left:8px}.mb-half{margin-bottom:8px}.dashes{display:none}button{font-family:inherit}.states{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.state{border:1px solid #c8ceca;border-radius:4px;padding:14px;background:#f7f8f8}.state p{margin:0 0 8px;color:#59635d;font-size:12px}.state button{font-size:12px;color:#0060a9;background:white;border:1px solid #b8c6d4;border-radius:4px;padding:7px 10px}.state button:disabled{opacity:.65}.note{margin-top:20px}@media(max-width:575px){body{padding:20px}.card{padding:16px}.states{grid-template-columns:1fr}}</style><script id="proposal-css" type="text/plain">
[data-mpkr-south-korea-gateway=true]{--mpkr-gateway-foreground:#202124;--mpkr-gateway-dark:#202124;min-height:140px}
.mpkr-south-korea-gateway__content{padding:16px calc(var(--mpkr-gateway-arrow-rail-width) + 16px) 16px 16px}
.mpkr-south-korea-gateway__title{margin:0 0 8px;line-height:1.4}
.mpkr-south-korea-gateway__copy{margin:0;font-size:14px;line-height:1.65}
.mpkr-directory-tabs{gap:24px}
.mpkr-directory-tabs button{min-height:40px;padding:6px 0;color:#59635d}
.mpkr-directory-tabs button[aria-selected=true]{color:#0060a9}
.mpkr-directory-load{margin-left:auto;min-height:36px}
.mpkr-directory-countries{column-count:3;column-gap:24px}
.mpkr-directory-country{margin-bottom:16px}
.mpkr-directory .clearfix>div:first-child{display:flex;align-items:baseline;gap:12px;min-height:36px;padding:6px 0;border-bottom:1px solid #e3e7e5}
.mpkr-directory .clearfix a{float:none;order:0;flex:1;min-width:0;max-width:none!important;overflow-wrap:anywhere;white-space:normal}
.mpkr-directory .number{float:none;order:1;min-width:4ch;text-align:right;font-variant-numeric:tabular-nums;color:#59635d}
@media(max-width:700px){.mpkr-directory-countries{column-count:2}}
@media(max-width:543px){.mpkr-directory-countries{column-count:1}.mpkr-directory-load{margin-left:0}.mpkr-directory-toolbar{gap:12px}}
</script><h1>다음 시안 · 메인 진입 영역과 지역 디렉터리</h1><p class="intro">기존 이동 방식과 대륙 탭을 유지하면서, 제목·행 간격·등록 수 정렬을 정리하는 안입니다.</p><div class="label">메인 · 대한민국 바로가기</div><div class="gateway text-center pb-2 border-light"><h1>Beyond the Guidebook</h1><h3>Routes shared by climbers</h3></div><div class="label">지역 디렉터리 · 일부 국가 예시</div><div class="card"><div id="route-guide"><a href="#">원본 아메리카 목록</a></div></div><div class="label">등록 수 버튼의 상태</div><div class="states"><div class="state"><p>조회 중 · 버튼 중복 실행 방지</p><button id="loading" disabled></button></div><div class="state"><p>일부 등록 수를 확인하지 못했습니다.</p><button id="partial"></button></div></div><p class="note"><b>컨펌 전 시안이며 제품에는 아직 적용하지 않았습니다.</b><br>표시된 등록 수는 배치 확인용 예시 값입니다. 실제 소스의 진입 영역·디렉터리에 검토용 스타일만 덧씌웠습니다.</p><script>${bundle.outputFiles[0].text}</script></html>`);
console.log('Wrote next directory finishing proposal');
