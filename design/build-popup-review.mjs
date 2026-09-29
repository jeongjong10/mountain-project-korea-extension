import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Local review only: no extension storage or production popup changes.
const compiled = await build({ entryPoints: ['src/ui/design-tokens.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { UI, UI_TOKEN_CSS } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const icon = `data:image/png;base64,${(await readFile('public/icon/128.png')).toString('base64')}`;
const states = [
  { label: '켜짐', enabled: true, message: '번역, 지도·통계 등 페이지 편의 기능이 켜져 있습니다.' },
  { label: '꺼짐', enabled: false, message: '원래 페이지로 표시합니다. 다시 켜면 확장 기능이 적용됩니다.' },
];
const cards = states.map(({ label, enabled, message }) => `<section class="example">
  <h2>확장 기능 ${label}</h2>
  <article class="popup" aria-label="확장 기능 ${label} 팝업 시안">
    <header><img src="${icon}" alt="MP KOREA" width="44" height="44"><div><strong>Mountain Project Korea</strong><p>한국어 번역과 탐색</p></div></header>
    <label class="setting"><span>확장 기능</span><span class="setting-value"><span class="state">${label}</span><input type="checkbox" role="switch" aria-label="확장 기능" ${enabled ? 'checked' : ''}></span></label>
    <p class="status" role="status">${message}</p>
    <p class="error" role="status" hidden>설정을 저장하지 못했습니다.<br>다시 시도해 주세요.</p>
    <a class="destination" href="https://www.mountainproject.com/area/106225629/south-korea" target="_blank" rel="noopener">대한민국 지역 열기 <span aria-hidden="true">↗</span></a>
    <footer><a href="https://github.com/jeongjong10/mountain-project-korea-extension#readme" target="_blank" rel="noopener">사용 안내</a><a href="mailto:whdduf972@gmail.com">문의</a><span>${version}</span></footer>
  </article>
</section>`).join('');
const css = `${UI_TOKEN_CSS}
@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}
*{box-sizing:border-box}body{margin:0;padding:32px 36px;background:${UI.color.surfaceSubtle};color:${UI.color.text};font-family:ReviewKorean,${UI.font.family}}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.5px;color:${UI.color.link}}h1{font-size:23px;letter-spacing:-.6px;margin:8px 0 10px}.intro,.note{font-size:13px;color:${UI.color.muted};line-height:1.8;margin:0}.examples{display:flex;align-items:flex-start;gap:28px;margin-top:26px}.example{width:332px}h2{font-size:12px;font-weight:500;color:${UI.color.muted};margin:0 0 10px}
.popup{width:332px;padding:20px;border:1px solid var(--mpkr-nav-border);border-radius:var(--mpkr-radius-nav);background:var(--mpkr-nav-surface);color:var(--mpkr-nav-text)}header{display:flex;gap:12px;align-items:center;margin-bottom:22px}header img{display:block;flex:none;border-radius:var(--mpkr-radius-control)}strong{font-size:14px;font-weight:700;letter-spacing:-.4px;white-space:nowrap}header p{margin:5px 0 0;font-size:12px;color:var(--mpkr-nav-muted)}
.setting{display:flex;align-items:center;justify-content:space-between;min-height:52px;padding:0 14px;border:1px solid var(--mpkr-nav-border);border-radius:var(--mpkr-radius-control);background:var(--mpkr-nav-surface-hover);font-size:14px;font-weight:600;cursor:pointer}.setting-value{display:flex;align-items:center;gap:12px}.state{font-size:12px;color:var(--mpkr-nav-link)}.setting:has(input:not(:checked)) .state{color:var(--mpkr-nav-muted)}.setting:has(input:focus-visible){outline:2px solid var(--mpkr-nav-focus);outline-offset:3px}
input{appearance:none;position:relative;flex:none;width:32px;height:20px;margin:0;border:1px solid var(--mpkr-nav-switch-border);border-radius:10px;background:var(--mpkr-nav-switch-off);color:var(--mpkr-nav-switch-thumb);cursor:pointer}input::before{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:currentColor}input:checked{background:var(--mpkr-nav-switch-on);border-color:var(--mpkr-nav-switch-on);color:var(--mpkr-nav-switch-on-thumb)}input:checked::before{left:14px}
.status{min-height:44px;margin:14px 0 20px;font-size:12px;line-height:1.75;color:var(--mpkr-nav-muted)}.error{margin:0 0 16px;font-size:12px;line-height:1.75;color:var(--mpkr-nav-text);border-left:2px solid var(--mpkr-nav-link);padding-left:10px}.destination{display:flex;justify-content:space-between;align-items:center;min-height:44px;padding:11px 0;border-top:1px solid var(--mpkr-nav-border);text-decoration:none;font-size:13px;font-weight:600;color:var(--mpkr-nav-link)}.destination:hover{text-decoration:underline}.destination span{font-size:17px}footer{display:flex;gap:16px;align-items:center;border-top:1px solid var(--mpkr-nav-border);padding-top:14px;font-size:11px}footer a{color:var(--mpkr-nav-muted);text-decoration:none}footer a:hover{color:var(--mpkr-nav-link);text-decoration:underline}footer span{margin-left:auto;color:var(--mpkr-nav-muted)}a:focus-visible,button:focus-visible{outline:2px solid var(--mpkr-nav-focus);outline-offset:3px}
.note{margin-top:24px}.note strong{color:${UI.color.text};font-size:13px}.review-error{border:0;background:none;padding:0;font:inherit;color:${UI.color.link};cursor:pointer;text-decoration:underline}@media(max-width:740px){body{padding:24px}.examples{flex-wrap:wrap;gap:24px}.example,.popup{width:100%;max-width:332px}}@media(forced-colors:active){input{appearance:auto}input::before{content:none}}
`;
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MP Korea 팝업 디자인 컨펌</title><style>${css}</style><body>
<div class="eyebrow">MP KOREA · 03</div><h1>팝업 · 다크 디자인 시안</h1><p class="intro">확정한 상단 바의 색상과 KOREA 아이콘을 이어서 사용했습니다.</p><main class="examples">${cards}</main>
<p class="note"><strong>컨펌 후 실제 팝업에 적용합니다.</strong> 스위치는 시안 안에서만 작동합니다.<br>번역 엔진의 준비·미지원 안내는 다음 작업에서 다룹니다.<br><button type="button" class="review-error">설정 저장 실패 상태 보기</button></p>
<script>const messages=${JSON.stringify(states.map(s => s.message))};document.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{const popup=input.closest('.popup');popup.querySelector('.state').textContent=input.checked?'켜짐':'꺼짐';popup.querySelector('.status').textContent=messages[input.checked?0:1]}));document.querySelector('.review-error').addEventListener('click',()=>{const visible=[...document.querySelectorAll('.error')].some(e=>!e.hidden);document.querySelectorAll('.error').forEach(e=>e.hidden=visible)});</script></body></html>`;
await writeFile('design/review/popup-proposal-dark.html', html);
console.log('Wrote design/review/popup-proposal-dark.html');
