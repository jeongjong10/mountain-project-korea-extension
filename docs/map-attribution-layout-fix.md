# 지도 출처 로고와 하단 안내문 배치 보완

작성일: 2026-09-28. 이 기록은 지도 관련 소스 변경과 제한된 합성 브라우저 검증에 관한 것이다. 최종 출시 빌드의 실제 Mountain Project 지도 검증은 별도로 수행해야 한다.

## 문제와 변경

기존 동결 빌드 `631dfdbb8296e2c04bc6d0fb8fe97ac1e5f2ec087c0fcc438d80212c83e4c32b`의 실페이지 확인에서 iframe 문서의 `scrollHeight`와 `clientHeight`가 모두 760px이어서 스크롤할 여유가 없었다. Mapbox 로고는 DOM에 남아 있었지만 하단 고정 `#access-gate` 안내문에 가려졌다. 원본 지도는 문서 높이가 더 길어 보통 스크롤로 로고를 볼 수 있었다. 원본과 iframe 모두 `#attribution-popup`은 사이트 자체의 접힌 상태였다. 자세한 당시 근거는 `p1-verification.md`의 제한 검증 기록에 보존되어 있다.

이번 변경은 확인된 지도 iframe 안에서 하단을 덮는 고정 안내문의 높이만큼 문서 끝에 빈 공간을 추가한다. 16px의 여유를 더하여 일반 문서 스크롤로 지도 하단 로고를 안내문 위로 올릴 수 있게 했다. 안내문이 없거나 숨겨졌거나 일반 문서 흐름에 놓이면 공간을 제거한다. 늦게 나타난 안내문, 안내문 높이 변경, 창 크기 변경에도 다시 계산한다.

`#access-gate`와 그 링크·문구·스타일·동작, Mapbox 로고, 원본의 접힌 출처 팝업은 변경하지 않는다. 로그인을 시도하거나 안내문을 닫지 않는다. 기존 iframe과 합의된 헤더·푸터·쿠키 안내 숨김 규칙은 유지한다. iframe 재로드 및 기능 종료 시 추가한 공간, 관찰자, resize 리스너를 정리한다. 자동으로 스크롤하지 않는다.

변경 파일:

- `src/ui/south-korea-map-embed.ts`: 안내문 높이에 대응하는 공간 및 수명 관리.
- `src/sites/mountain-project/contract/selectors/map.ts`: `fixedAccessNotice` 선택자 한 개 추가.
- `test/ui/south-korea-map-embed.test.ts`: 동적 안내문, 크기 변경, 원본 노드 보존, 재로드, 종료 후 정리 회귀 테스트 두 개 추가.

## 확인 결과

- 지도 전용 Vitest: 1개 파일, 19개 테스트 통과.
- 사이트 contract 경계 Vitest: 1개 파일, 1개 테스트 통과.
- 소스 TypeScript 검사: 통과 (`tsc -p tsconfig.json --noEmit`).
- 테스트 TypeScript 검사: 통과 (`tsc -p tsconfig.test.json --noEmit`).
- 변경 파일 `git diff --check`: 통과.
- 격리 Chrome for Testing 149.0.7827.55에서 수정 전·후 실제 `AreaMapEmbed` 코드를 각각 번들링하여 공개 `mount()` 및 지도 펼침 경로를 호출했다. 이 임시 번들은 `.output`을 생성하거나 변경하지 않았다.

브라우저 검증은 임시 프로필과 직접 작성한 합성 Area/map HTML만 사용했다. CDP에서 두 HTML 응답을 공급하고 다른 페이지 요청을 차단했으므로 실제 Mountain Project 페이지·지도 타일·계정에는 접근하지 않았다. 원본 하단 고정 안내문과 출처 팝업의 구조를 재현한 조건에서 보통 `window.scrollTo()`로 문서 끝까지 이동한 결과다. 아래 수치는 iframe 내부 좌표이며, 로고 중앙의 `elementFromPoint()`도 함께 검사했다.

| 전체 화면 폭 | 상태 | iframe 높이 | 문서 높이 | 스크롤 Y | 로고 아래쪽 | 안내문 위쪽 | 로고 중앙 최상위 요소 |
|---|---|---:|---:|---:|---:|---:|---|
| 1440px | 수정 전 | 760 | 760 | 0 | 682 | 560 | 안내문 영역 |
| 1440px | 수정 후 | 760 | 904 | 144 | 538 | 560 | Mapbox 로고 링크 |
| 390px | 수정 전 | 640 | 640 | 0 | 602 | 440 | 안내문 영역 |
| 390px | 수정 후 | 640 | 824 | 184 | 418 | 440 | Mapbox 로고 링크 |

두 화면에서 수정 전 가림 현상을 재현하고 수정 후 로고가 가리지 않는 위치까지 스크롤됨을 확인했다. 390px 수정 전·후 스크린샷도 직접 확인했다. 안내문은 계속 표시됐고 HTML이 그대로였으며, 출처 팝업은 계속 `display: none`이었다. 종료 뒤 확장이 추가한 공간과 iframe 스타일 노드는 모두 0개였다. 브라우저 예외는 0건, 실행 중 대상 소스 해시 변화는 없었다. 검사한 브라우저는 종료했다.

이 검증은 합성 문서에서의 실제 브라우저 배치·정리 검증이며 실제 지도 런타임이나 최종 확장 빌드의 실페이지 성공을 대신하지 않는다. 특히 실제 사이트의 문서 높이·overflow 규칙, 지도 상호작용과 함께 최종 RC에서 재확인해야 한다. 처음 펼친 위치에서 로고를 강제로 노출하는 변경도 아니다. 사용자가 iframe 문서를 스크롤하면 볼 수 있는 공간을 확보하는 변경이다.

첫 임시 harness 실행은 합성 Area fixture의 `.mp-sidebar` 누락으로 mount 전에 중단됐다. fixture만 보완한 뒤 위 결과를 얻었으며, 그 실패에 대응하는 제품 코드 수정은 없었다.

## 수정 전후 식별과 증거

이번 작업 시작 시점의 파일 사본을 기준으로 비교했다. 저장소 전체 diff에는 다른 진행 중인 변경이 포함되므로 이번 보완의 범위 판단에는 아래 scoped diff를 사용한다.

| 파일 | 수정 전 SHA-256 | 수정 후 SHA-256 |
|---|---|---|
| `src/ui/south-korea-map-embed.ts` | `7d402ffdc6207fb3a81cc6f4ea5e2a1048a3f605c17bf698dd7108592eb255f5` | `609f10fe0875d79d2e7a7da630dea51835a9ea7c23953e9c2c064184d2c9c96e` |
| `test/ui/south-korea-map-embed.test.ts` | `4e3e696854611e5b7ccd580738b9be2b1868a0bef5c17e7ed4ee29dde8a40819` | `d79656ae252ea843af42893fe7f5627bc03e919271a35759c6a9046e0c0f3a2b` |
| `src/sites/mountain-project/contract/selectors/map.ts` | `b59a90e4bff42fd2c6ae76d5c51b350c9b1fd7b64e106d9bfc495bc08d1746c9` | `bb43f3f993e7873ae11572f51365bf9875bc652f4784fd223892ca0f5c54f04b` |

현재 작업 환경의 원자료 경로:

- 수정 전 세 파일, `final-fingerprints.json`, `map-layout-scoped.diff`: `/tmp/mpkr-map-layout-before-Il1uXd/`.
- 브라우저 검사 스크립트: `/tmp/mpkr-map-layout-browser-regression.mjs`.
- 브라우저 원자료: `/tmp/mpkr-map-layout-regression-JUOZMr/results.json`.
- 화면: 같은 폴더의 `before-1440.png`, `after-1440.png`, `before-390.png`, `after-390.png`.

임시 경로는 현재 환경에만 남으므로 출시 증거를 보관할 때 필요한 파일을 별도 아카이브해야 한다. 이번 작업에서 `.output` 재생성, 개인정보방침 재게시, 사용자 프로필 접근, 문의 전송은 수행하지 않았다.

## 같은 날 최종 RC 후속

동결 RC `b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`를 Chrome 154에서 실제 사이트로 후속 확인했다. 일반 iframe 스크롤 뒤 Mapbox 로고가 원본 가입 안내문 위에서 보였고, 내부/외부 hit test와 스크린샷으로 확인했다. 안내문의 자체 스크롤 축소는 확장 없는 원본 지도와 `climb-main.js`에서도 확인했으며, 문구·링크·접힌 출처 팝업은 보존됐다. 세부 결과와 제한은 `rc-live-verification-2026-09-28.md` 및 `evidence/rc-live-verification-2026-09-28.json`에 기록했다. 위의 합성 검증은 별도 증거로 유지한다.
