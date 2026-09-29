import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Run from the repository root. These are local review pages, not a published demo.
const repo = process.cwd();
const approved = process.argv.includes('--approved');
const dark = approved || process.argv.includes('--dark');
const reviewName = approved ? 'navigation-applied' : dark ? 'navigation-proposal-dark' : 'navigation-proposal';
const themeBuild = await build({ entryPoints: ['src/ui/design-tokens.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { UI } = await import(`data:text/javascript;base64,${Buffer.from(themeBuild.outputFiles[0].text).toString('base64')}`);
const controlsBuild = await build({ entryPoints: ['src/ui/navigation-controls.ts'], bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'MPReview' });
const controls = controlsBuild.outputFiles[0].text;
const icon = `data:image/png;base64,${(await readFile('public/icon/128.png')).toString('base64')}`;
const logo = `data:image/svg+xml;base64,${(await readFile('design/source/mp-logo-original.svg')).toString('base64')}`;
const proposal = {
  surface: UI.color.surfaceSubtle,
  surfaceHover: UI.color.buttonHover,
  border: UI.color.border,
  divider: UI.color.border,
  text: UI.color.text,
  link: UI.color.link,
  muted: UI.color.muted,
  focus: UI.color.link,
  switchOff: UI.color.border,
  switchBorder: UI.color.borderHover,
  switchThumb: UI.color.surface,
  switchOn: UI.color.link,
  switchOnThumb: UI.color.surface,
};
if (dark) Object.assign(proposal, {
  surface: '#202124', surfaceHover: '#2c3036', border: '#5f6368', divider: '#5f6368',
  text: '#fff', link: '#91c3e8', muted: '#b8c6d4', focus: '#91c3e8',
  switchOff: '#5f6368', switchBorder: '#7a8791', switchThumb: '#fff',
  switchOn: '#5ba2d8', switchOnThumb: '#fff',
});
if (approved) Object.assign(proposal, UI.nav);
const override = `
#header-container .mp-nav-control {background:${proposal.surface};border-color:${proposal.border};color:${proposal.text}}
#header-container a.mp-nav-control {color:${proposal.link}}
#header-container .mp-nav-control:hover {background:${proposal.surfaceHover}}
#header-container a.mp-nav-control::before {background:${proposal.divider}}
#header-container .mp-nav-control:focus-visible,#header-container .mp-nav-control:has(input:focus-visible) {outline-color:${proposal.focus}}
#header-container .mp-nav-control input {background:${proposal.switchOff};border-color:${proposal.switchBorder};color:${proposal.switchThumb}}
#header-container .mp-nav-control input:checked {background:${proposal.switchOn};border-color:${proposal.switchOn};color:${proposal.switchOnThumb}}
#header-container label.mp-nav-control:has(input:not(:checked)) .mp-nav-copy {color:${proposal.muted}}
`;
await writeFile(`design/review/${reviewName}-palette.json`, JSON.stringify(proposal, null, 2) + '\n');
await writeFile(`design/review/${reviewName}.css`, override.trim() + '\n');

const font = `@font-face{font-family:ReviewKorean;src:url('file:///mnt/c/Windows/Fonts/malgun.ttf')}`;
const shell = (enabled, mobile = false) => `<!doctype html><html lang="ko"><meta charset="utf-8"><style>${font}
*{box-sizing:border-box}body{margin:0;background:#fff;font:13px ReviewKorean,${UI.font.family}}#header-container{background:#151515;color:#fff;padding:14px 18px}.header-container{display:flex;align-items:center;gap:12px}.brand{width:${mobile ? 155 : 170}px;flex:none}.brand img{display:block;width:100%}nav{display:flex;gap:14px;margin-left:12px;font-size:12px;white-space:nowrap}.header-container__user{display:flex;align-items:center;gap:8px;flex:1;margin-left:auto}#user{display:flex;align-items:center}.user-img-avatar{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid #bdbdbd;background:#fff;color:#59635d;font-size:11px}#user a{color:#fff;text-decoration:none}.caption{margin:0;padding:12px 18px;color:${UI.color.muted};font-size:12px}.mp-nav-control{font-family:ReviewKorean,${UI.font.family}!important}@media(max-width:550px){nav{display:none}#header-container{padding:12px}.header-container{flex-wrap:wrap}}
</style><div id="header-container"><div class="header-container"><a class="brand" href="https://www.mountainproject.com/"><img src="${logo}" alt="Mountain Project"></a>${mobile ? '' : '<nav><span>루트 가이드</span><span>새 소식</span></nav>'}<div class="header-container__user"><div id="user"><a href="#" aria-label="사용자 메뉴"><div class="user-img-avatar">MP</div></a></div></div></div></div><p class="caption">${enabled ? 'ON · 파란색 스위치와 흰색 손잡이' : 'OFF · 회색 스위치와 보조 문구색'}</p><script>${controls.replaceAll('</script', '<\\/script')}\nconst bar=new MPReview.NavigationControls();bar.mount(async(value)=>bar.render(value));bar.render(${enabled});const style=document.createElement('style');style.textContent=${JSON.stringify(approved ? '' : override)};document.head.append(style);</script></html>`;
const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const iframe = (enabled, mobile = false) => `<iframe title="${mobile ? '좁은 창' : enabled ? '확장 켜짐' : '확장 꺼짐'}" ${mobile ? 'class="narrow"' : ''} srcdoc="${escapeAttribute(shell(enabled, mobile))}"></iframe>`;
const css = `${font}*{box-sizing:border-box}body{margin:0;background:${UI.color.surfaceSubtle};color:${UI.color.text};font-family:ReviewKorean,${UI.font.family};padding:32px 36px}h1{font-size:23px;margin:8px 0 10px;letter-spacing:-.6px}.eyebrow{font-size:11px;color:${UI.color.link};font-weight:700;letter-spacing:1.5px}.intro,.note{font-size:13px;color:${UI.color.muted};line-height:1.75;margin:0}.intro{margin-bottom:22px}.sample-label{font-size:12px;margin:16px 0 8px;color:${UI.color.muted}}iframe{display:block;width:100%;height:116px;border:1px solid ${UI.color.border};border-radius:${UI.radius.control};background:white}.narrow{width:390px;height:170px}.bottom{display:flex;gap:24px;align-items:flex-start}.legend{padding-top:40px;font-size:12px;line-height:2;color:${UI.color.muted}}.swatch{display:inline-block;width:12px;height:12px;border:1px solid ${UI.color.border};margin-right:8px;vertical-align:middle}.note{margin-top:18px}.note strong{color:${UI.color.text}}@media(max-width:600px){body{padding:20px}.bottom{display:block}.narrow{max-width:100%}.legend{padding-top:16px}}`;
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MP 상단 바 색상 컨펌</title><style>${css}</style><body><div class="eyebrow">MP KOREA · DESIGN REVIEW</div><h1>${approved ? '상단 바 · 다크 버전 적용' : dark ? '상단 바 · 다크 반전 시안' : '상단 바 · 밝은 회색과 파란색'}</h1><p class="intro">${dark ? '어두운 바탕에 밝은 글자와 파란색 조작부를 배치했습니다.' : 'MP 원본 헤더 안에서 확장 조작부의 색상을 바꾼 시안입니다.'}</p><div class="sample-label">데스크톱 · 켜짐</div>${iframe(true)}<div class="sample-label">데스크톱 · 꺼짐</div>${iframe(false)}<div class="bottom"><div><div class="sample-label">좁은 창 · 390px</div>${iframe(true, true)}</div><div class="legend"><div><i class="swatch" style="background:${proposal.surface}"></i>${dark ? '어두운 바탕' : '밝은 회색 바탕'} ${proposal.surface}</div><div><i class="swatch" style="background:${proposal.link}"></i>${dark ? '밝은 파란 링크' : '파란 링크·ON 스위치'} ${proposal.link}</div><div><i class="swatch" style="background:${proposal.border}"></i>${dark ? '회색 테두리·OFF 스위치' : '회색 테두리·OFF 스위치'} ${proposal.border}</div></div></div><p class="note"><strong>${approved ? '사용자 컨펌을 받은 색상을 실제 소스에 적용했습니다.' : '컨펌 전 시안이며 실제 상단 바에는 아직 적용하지 않았습니다.'}</strong><br>스위치는 이 시안 안에서만 작동합니다. ${approved ? '이 화면은 별도 색상 덮어쓰기 없이 실제 컨트롤 소스를 렌더링합니다.' : '확정 후 팝업 디자인을 이어서 진행합니다.'}</p></body></html>`;
await writeFile(`design/review/${reviewName}.html`, html);

const swatches = [['본문 링크', UI.color.link], ['보조 문구', UI.color.muted], ['공통 테두리', UI.color.border], ['기본 표면', UI.color.surface], ['밝은 표면', UI.color.surfaceSubtle], ['호버 배경', UI.color.surfaceHover]];
const overview = `<!doctype html><html lang="ko"><meta charset="utf-8"><style>${css}.brand{display:flex;gap:28px;align-items:center;margin-top:26px}.brand>img{width:128px;height:128px}.sizes{display:flex;align-items:flex-end;gap:24px;margin-top:16px}.size{text-align:center;font-size:11px;color:${UI.color.muted}}.size img{display:block;margin:0 auto 8px}.swatches{display:flex;gap:16px;margin:28px 0}.color{width:98px;font-size:11px}.paint{height:50px;border:1px solid ${UI.color.border};border-radius:${UI.radius.control};margin-bottom:8px}.code{font-family:monospace;margin-top:4px}.details{font-size:13px;line-height:1.9;color:${UI.color.muted}}</style><body><div class="eyebrow">MP KOREA · 01 / 02</div><h1>대표 아이콘 · 공통 디자인</h1><p class="intro">하단 전체 폭 KOREA · 기존 소스의 파란색·밝은 회색 기준</p><div class="brand"><img src="${icon}" alt="MP KOREA"><div><b>브라우저 확장 아이콘</b><div class="sizes">${[16, 32, 48].map(size => `<div class="size"><img src="../../public/icon/${size}.png" width="${size}" height="${size}">${size}px</div>`).join('')}</div></div></div><div class="swatches">${swatches.map(([label, value]) => `<div class="color"><div class="paint" style="background:${value}"></div>${label}<div class="code">${value}</div></div>`).join('')}</div><p class="details">본문 글꼴: 원본 페이지 상속 · 확장 컨트롤: 시스템 글꼴<br>모서리: 작은 요소 2px / 일반 컨트롤 4px / 상단 바 7px<br>기본 간격: 4 · 8 · 12 · 16 · 24px (루트 글자 크기 16px 기준)<br>상단 바는 승인된 다크 색상을 사용합니다.</p></body></html>`;
await writeFile('design/review/icon-and-tokens.html', overview);
console.log(`Local review pages written in ${repo}/design/review`);
