# 최종 RC 제한 실페이지 검증 — 2026-09-28

동일 RC에서 실제 Chrome 모델 번역, 원문 보기·복귀, OFF 후 원문 보존, 통계 iframe ON/OFF, 지도 로고 노출을 확인했다. 이전 `631dfdbb…` 빌드에서 남았던 모델 초기화·지도 배치 공백은 이번 **`b4ee3024…` RC의 대표 경로**에서 해소됐다. 전체 본문 번역이나 모든 환경의 출시 승인을 뜻하지 않는다.

## 빌드와 실행 범위

- 유지한 빌드: `.output/chrome-mv3/`. 검증 때 사용한 별도 사본·ZIP은 사용자 요청으로 제거했으며, 제거 직전 기존 빌드 6파일이 검증 사본과 모두 같은 해시임을 확인했다.
- `content-scripts/content.js`: `b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`.
- 입력 digest: `b960bb8c698a0eed1824652ff9df496b7600ec6a05fdbcddd946813c0c47774a`.
- 루트 담당자가 동결 소스에서 소스/테스트 타입 검사, 52개 파일·490개 테스트, 빌드를 통과한 후보를 제공했다. 이 검증 담당자는 제품 수정·재빌드하지 않았다.
- 14:44:45–14:45:12 KST 본 검증, 14:46:41–14:46:49 원본 지도 비교, 14:47:32–14:48:07 원문 복원·보호 동작 후속. RC 전체 6개 파일의 크기·해시를 두 확장 실행 전후 비교했고 모두 같았다.
- Chrome `154.0.8037.57`, Linux headless, 1440×1100. 공식 모델이 설치된 별도 임시 프로필을 재사용했다. 사용자의 Chrome, 계정 또는 프로필에 접근하지 않았다.
- 공식 browser-target CDP `Extensions.loadUnpacked`로 절대 경로의 RC를 로드하고 `getExtensions`로 경로·활성 상태를 확인했다. 추가 unsafe-extension-debugging 플래그는 필요하지 않았다. [공식 프로토콜](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/Extensions.pdl).
- 페이지 요청은 GET/HEAD/OPTIONS만 허용했다. 본 검증에서 57개, 복원 후속에서 43개의 다른 메서드 요청이 차단됐다. 이 조건은 무제한 네트워크 세션과 다르며 광고·분석·사이트 예외에 영향을 줄 수 있다.
- 로그인·가입·댓글·등반 기록 제출, 안내문 닫기, 원본 출처 팝업 강제 열기는 수행하지 않았다. 모든 검사 브라우저를 종료했다.

## 실제 번역과 원문 복원

대상은 [South Korea Area](https://www.mountainproject.com/area/106225629/south-korea), [Whitney Gilman Ridge Route](https://www.mountainproject.com/route/105872668/whitney-gilman-ridge)다. 두 페이지, 지도와 통계 iframe의 주 문서는 HTTP 200으로 로드됐다.

`Translator`가 native 함수임을 확인했고, 공급자나 번역 문자열을 주입하지 않았다. Area 초기 availability는 `downloadable`이었으나 확장 ON을 위한 실제 포인터 클릭 이후 한국어 본문이 생성됐다. Route에서는 `available`이었다. 설치가 완료된 같은 프로필의 실제 API·확장 코드 경로를 사용했다.

| 확인 | Area | Route |
|---|---|---|
| 실제 한국어 번역 본문 | 확인 | 확인 |
| 10초 추가 관찰 뒤 내용이 있는 번역 블록 | 11개 | 11개 |
| 원문 보기 | 원문 단락 표시, `aria-expanded=true` | 동일 |
| 원문 숨기기 | 토글 직전 단락 표시 상태로 복귀 | 동일 |
| OFF 후 원문 노드·문자열·자식 순서/동일성 | 2개 본문 섹션 모두 동일 | 3개 본문 섹션 모두 동일 |
| OFF 후 번역 블록/원문 토글 | 각각 0개 | 각각 0개 |

번역 블록 수는 관찰 시점의 DOM 수이며 페이지 전체 문단 수나 완역률이 아니다. 원문 보기 상태에서도 번역과 원문을 함께 표시하는 기존 방식이 유지됐다. 이미 번역된 단락만 숨기고 아직 번역되지 않거나 번역 대상으로 선택되지 않은 단락은 남기는 동작을 확인했다.

OFF 후 텍스트·노드·자식 순서와 표시는 복원됐다. 일부 자식에 빈 `style=""` 속성이 남아 HTML 문자열 자체는 다를 수 있었다. 빈 style 속성만 정규화해 비교하면 조사한 5개 섹션 모두 동일했다. 따라서 **바이트 단위 전체 DOM/HTML 복원**은 주장하지 않는다.

## 보호 때문에 번역을 보류한 범위

Route의 추가 10초 관찰에서는 다음 3곳에 형식 보호 안내가 있었다.

| 위치 | 원문 길이 | 번역 본문 | 원문 상태 |
|---|---:|---:|---|
| Protection / 보호 장비 섹션 | 501자, 문단 1개 | 0자 | `display:block` 유지 |
| 사진 카드 캡션 1 | 57자 | 0자 | 원문 표시 유지 |
| 사진 카드 캡션 2 | 57자 | 0자 | 원문 표시 유지 |

제품 코드는 보호 토큰의 누락·중복을 `PlaceholderIntegrityError`로 처리하고 번역을 적용하지 않은 채 원문과 재번역 안내를 보여준다 (`src/core/translation-text-policy.ts`, `src/localization/page-translation-controller.ts`). 실제 표시는 이 의도된 보호 경로와 일치한다. 원문 손실이나 렌더러 충돌로 판정할 근거는 없지만, 해당 콘텐츠의 번역은 완료되지 않았으므로 **번역 범위의 제한은 남아 있다**. UI 관찰만으로 어느 보호 토큰이 실패했는지 또는 모델 출력의 정확한 원인은 확정할 수 없다. 후속 품질 개선 대상으로 보호 토큰 처리와 해당 문단을 검토할 수 있으며, 이번 검증에서 보호 검사를 완화하거나 RC를 변경하지 않았다.

Area에서는 추가 관찰 시 보호 실패 안내가 0개였다. 기계 번역의 언어적 정확도·전체 문단 번역률은 이번 제한 검증의 합격 항목이 아니다.

## 지도 로고와 원본 안내문

지도 iframe은 1218×760, 캔버스 1개였고 실제 위성 지도·마커를 스크린샷에서 확인했다. 처음 열린 위치에서는 원래 하단 안내문이 로고를 덮었지만, 추가 공간 때문에 문서의 일반 스크롤이 가능했다. `window.scrollTo()`만 사용해 아래로 이동했으며 notice/CSS를 강제로 바꾸지 않았다.

- 처음 문서 높이 973px, 공간 215px. 스크롤 후 원본 안내문이 자체적으로 작아지자 높이 889px, 공간 131px로 자동 갱신됐다.
- 최종 iframe `scrollY=129`. 로고는 y=556.59–579.59px, 안내문 위쪽은 y=645.31px이었다.
- 로고 중심의 iframe 내부 최상위 hit-test 요소는 `mapboxgl-ctrl-logo`, 외부 문서에서는 해당 iframe이었다. 로고와 안내문이 동시에 보이는 스크린샷을 직접 확인했다.
- 안내문의 내부 문구·로그인 링크·구조는 그대로이며 `display:flex`로 남았다. OFF 후 추가 공간과 iframe 스타일 노드는 0개였다.
- `#attribution-popup`의 HTML은 그대로이며 원본의 접힌 `display:none` 상태를 유지했다. 지도 제공자 라이선스나 출처 표시의 법적 충분성은 별도 판단이다.

안내문 outerHTML 전체가 스크롤 전후 같아야 한다는 최초 harness 조건은 실제 사이트 동작을 과도하게 제한했다. 확장을 끈 새 프로필의 원본 지도에서도 보통 스크롤 400px 후 같은 `padding:0px` 및 높이 **198.6875→114.6875px** 변화가 재현됐다. 원본 `climb-main.js`에는 pageYOffset이 100을 넘으면 `.access-gate`의 padding을 0으로 바꾸는 scroll handler가 있었다. 내부 HTML은 동일했다. 즉 이 축소는 원본 사이트의 일반 스크롤 동작이며 확장이 안내문을 닫은 결과가 아니다.

## 통계와 예외

Route stats iframe은 실제 `#route-stats`를 로드했고 ON→OFF→ON에서 **1→0→1**이었다. 중첩 stats iframe은 0개였다. iframe 내부의 기존 확장 스위치 1개는 유지되므로, 첫 harness가 스위치 0개를 요구한 조건은 잘못된 가정이었다.

본 검증에서는 Area에서 MP `ap-vendor-full.js` 및 페이지 AJAX handler를 거치는 `ready` TypeError 2건, Route에서 0건이 관찰됐다. 복원 후속에서는 Area의 같은 오류 2건과 gstatic reCAPTCHA 스크립트의 `charCodeAt` TypeError 1건, Route 0건이었다. 기록된 stack은 사이트/제3자 경로이며 확장 소스 경로는 없었다. 이전 확장 없는 비교에서도 `ready` 증상이 발생했지만, 이번 새 Chrome에서 완전한 무제한 네트워크 대조를 수행한 것은 아니다. 순수한 원본 사이트 결함 또는 확장과 무관한 원인이라고 단정하지 않는다.

## 기록과 재현

영구 최소 요약은 `docs/evidence/rc-live-verification-2026-09-28.json`이다. 빌드 해시, count/boolean/좌표, 보호 보류 위치, 예외 경로 및 원자료 해시를 보관하고 전체 원문·고지 HTML과 광고 쿼리 문자열은 옮기지 않았다. 최초 raw 결과의 과도한 조건 3개를 지우거나 성공값으로 덮지 않았으며, 올바른 요구사항과 교정 근거를 요약에 별도로 기록했다.

현재 환경의 임시 증거:

- 본 검증: `/tmp/mpkr-rc-live-Eql8g6/results.json`.
- 복원·보호 범위: `/tmp/mpkr-rc-restore-followup-GENVDq/results.json`.
- 원본 안내문 비교: `/tmp/mpkr-native-notice-GIJq0O/results.json`.
- 지도 로고/안내문 화면: `/tmp/mpkr-rc-live-Eql8g6/area-map-scrolled.png`.
- 통계 화면: `/tmp/mpkr-rc-live-Eql8g6/route-stats.png`.
- 실행 스크립트: `/tmp/mpkr-rc-live-check.mjs`, `/tmp/mpkr-rc-restore-followup.mjs`, `/tmp/mpkr-native-map-notice-control.mjs`.

스크린샷은 실제 원본 페이지 내용과 이용자 표시명을 포함한 **로컬 검증 증거**이며 공개 데모·스토어 이미지로 승인된 자산이 아니다. 사용자 설치본과 일치한다고 주장하지 않으며, 로그인 상태·계정 쓰기·모바일·다른 Chrome 버전은 이번 실페이지 검증 범위 밖이다.
