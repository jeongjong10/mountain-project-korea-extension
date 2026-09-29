# 포럼 번역 마무리 및 검증 — 2026-09-29

기존 공유 체크아웃의 변경을 이어받았다. 관련 없는 dirty 변경을 되돌리지 않았으며 커밋·푸시·사이트 게시·편집·투표·신고·계정 변경을 하지 않았다.

## 구현

- 포럼 홈, 최신 글, 섹션, 상세, 페이지네이션, 작성·답글·편집 URL을 경로 계약으로 분류한다. 실제 인용 진입점 `/edit/forum-message/0?replyToId=…&quoteId=…`와 `#reply`를 포함한다.
- 공개 검색은 `/search`의 `#onx-search` DOM 계약으로 지원한다. React 생성 클래스명이나 특정 게시글 ID를 구현에 사용하지 않는다. 검색 필터는 제목/집계 수 쌍의 구조를 인식하며 비동기 집계도 처리한다.
- 고정 UI는 사전으로 번역한다. `/add/` 및 `/edit/` 포럼 링크가 일반 기여 메뉴 분기에 가려지던 문제와 `href="#"` 로그인 버튼이 작성된 제목으로 분류되던 문제를 수정했다.
- 사용자 작성 본문, 상세 제목, 목록 제목, 검색 결과 카드의 `h3` 제목을 기존 TranslationProvider·원문 보기·재번역에 연결했다. 검색 카드의 작성자·날짜·발췌문은 번역 대상에 포함하지 않는다. 검색 카드의 원문/재번역 버튼은 링크 밖에 배치한다.
- 원문 노드·서식·링크·이벤트 핸들러를 보존한다. 인용 작성자, 서명, 코드, 사용자명, 날짜 및 폼의 name/value·숨김/비밀번호 필드·작성 중인 내용을 보호한다.
- 확장이 생성한 번역 복사본·버튼을 수집에서 제외한다. 원문 숨김의 display 스타일이 구조 토큰을 바꾸지 않게 하여 불필요한 재번역을 방지한다. 재번역 시 삭제될 확장 노드를 삽입 기준으로 삼지 않는다.

## 변경 파일

경로/사전/DOM 계약:

- `src/sites/mountain-project/contract/routes.ts`
- `src/sites/mountain-project/contract/text/forum.ts`
- `src/sites/mountain-project/contract/selectors/forum.ts`
- `src/sites/mountain-project/contract/selectors/search.ts`
- `src/sites/mountain-project/dom/page-adapter.ts`
- `src/sites/mountain-project/dom/page-capabilities.ts`

번역 실행/렌더링:

- `src/localization/direct-page-localizer.ts`
- `src/application/ports.ts`
- `src/rendering/dom-translation-format.ts`
- `src/rendering/original-preserving-renderer.ts`

회귀 검증:

- `test/fixtures/mountain-project/forum.ts`
- `test/localization/forum-pages.test.ts`
- `test/localization/forum-search.test.ts`
- `test/sites/mountain-project/contract/routes.test.ts`
- `test/sites/mountain-project/dom/forum-targets.test.ts`
- `test/sites/mountain-project/dom/page-capabilities.test.ts`
- `test/localization/page-translation-controller.test.ts`
- `test/localization/help-pages.test.ts`: 기존 고정 fixture 인덱스/배열의 타입만 명확히 했다. 런타임 검증 기대값은 변경하지 않았다.

이전 구현의 `contract/text/community.ts` 변경도 유지하며 연동을 검토했다.

## 자동 검증

```sh
npm test -- test/localization/forum-pages.test.ts test/localization/forum-search.test.ts test/sites/mountain-project/contract/routes.test.ts
npm test -- test/sites/mountain-project/dom/forum-targets.test.ts test/sites/mountain-project/dom/page-capabilities.test.ts test/sites/mountain-project/dom/page-adapter.test.ts test/localization/page-translation-controller.test.ts test/rendering/original-preserving-renderer.test.ts test/localization/format-preservation.test.ts
npm run typecheck:test
npm run build
```

포럼/검색/경로 총 111개, adapter/controller/renderer/형식 보존 총 110개, 합계 221개 focused 테스트가 통과했다. 마지막 실브라우저 수정 후에는 영향받은 포럼/검색 22개를 다시 검증했다. `npm run build`에 소스 타입 검사(`npm run typecheck`), WXT production build, 실제 bundle smoke가 포함된다.

기존 controller 테스트의 고정 20ms 대기는 최신 번역이 관찰될 때까지 기다리는 방식으로 바꾸고 정확한 수집 호출 횟수 검증은 유지했다. 동적 답글 fixture는 happy-dom이 생성하지 않던 tbody.insertAdjacentHTML 대신 실제 tr 노드를 append한다.

검토 중 별도로 실행한 도움말 suite는 당시 Getting Started 동적 카드 1건이 실패했다(7/8). 이후 공유 작업공간의 다른 작업에서 해당 테스트가 추가 변경되었으며 이 작업은 그 변경을 보존했다. 최종 도움말 런타임 suite나 전체 저장소 suite의 통과를 주장하지 않는다.

## 실제 Chrome 검증

검증 환경은 별도 임시 프로필의 실제 Chrome 149 headless이며, 스킬의 `browser-session.mjs`로만 시작했다. 최신 `.output/chrome-mv3`를 unpacked 확장으로 로드했다. 페이지 DOM/상태는 `live-browser.mjs`의 제한된 읽기 프로브로 확인하고, 탐색·스크린샷·확장 버튼 조작은 연결된 소유 브라우저에서 수행했다. 페이지 스크립트나 모의 번역 Provider를 주입하지 않았다.

실제 결과·접근 제한·최종 해시·cleanup 증거는 아래 최종 실행 결과에 기록한다.

## 최종 실행 결과

- Chrome 버전: `149.0.7827.55` (headless, 1440 × 1100 window).
- 검증한 `.output/chrome-mv3/content-scripts/content.js` SHA-256: `e91a8e1078ad09ad93a1eafb22a50ce9c9331e8dfdce1f95ff168468b40acd2a`. 검증 전후 일치했다.
- 최종 소스·테스트 타입 검사와 build/bundle smoke가 모두 통과했다.
- 실제 DOM 검사 결과는 [live-results.json](forum-verification-2026-09-29/live-results.json)에 보관했다.

| 페이지/경로 | 실제 결과 |
|---|---|
| `/forum` | `Mountain Project 포럼`, `장비`, `최근 글`, 게시판 이름/설명 한글. 상대 날짜와 사용자명은 원문 유지. |
| `/forum/:id/:slug` 및 `?page=2` | `클라이밍 일반`, `새 글 작성`, `주제`, `답글`, `최근 글`, `2 / … 페이지`. 실제 페이지 링크로 2페이지 확인. |
| `/forum/topic/:id/:slug` 및 `?page=2` | `답글 작성`, `로그인 후 답글 작성`, `원글`, `글 알림`, `이메일`, `사이트에서 알림`. 실제 토픽 2페이지 확인. |
| `#reply` | 번역된 `답글 작성` 클릭으로 동일 페이지 `#reply` 진입 확인. 게시하지 않음. |
| `/search?q=rope` | `전체 보기`, `루트`, `지역`, `사용자`, `사진`, `포럼`, `검색`, `정렬:`. 실제 정렬 메뉴의 `기본 순 / 최신 순 / 오래된 순`과 `별점 / 긴 순 / 짧은 순` 확인. |
| `/forum/latest` | `/auth/login?messageType=LatestPosts`로 이동. 인증 뒤 최신 목록은 접근하지 못함. 경로/목록 fixture 테스트로 보완. |
| `/add/forum-topic/:id` | 비로그인 GET에서 HTTP 403. 실제 작성 폼 검증 불가. |
| `/add/forum-message/:id` | 비로그인 GET에서 HTTP 404. 해당 작성 화면 검증 불가. |
| `/edit/forum-message/0?replyToId=…&quoteId=…` 및 `/edit/forum-message/:id` | 비로그인 GET에서 HTTP 403. 실제 인용/수정 폼 검증 불가. |

인증 관련 제한은 우회하지 않았다. 작성·답글·편집 폼은 synthetic fixture에서 라벨, 초안, 이벤트, 제출값, 숨김/비밀번호 필드, exact restore를 검증했다. 403/404 화면에서 경로 분류가 작동하는 것과 실제 폼 번역이 확인된 것을 구분한다.

Chrome Provider는 언어팩 준비가 필요하다는 상태였다. 확장의 `번역 준비 시작`을 누른 뒤에도 관측 기간 동안 `준비 중…`이 유지되었다([provider-preparation.json](forum-verification-2026-09-29/provider-preparation.json)). 따라서 실제 엔진 번역 완료 및 실제 번역문에 대한 원문 보기/재번역은 확인하지 못했다. 원문 노드·서식·링크·작성자 보존, 원문 토글, 변경된 원문으로 재번역, provider 호출 횟수, 중복 복사본 방지는 자동 테스트에서 검증했다. 실제 Chrome에서는 원문 유지와 확장 준비 UI를 확인했다.

확장 미설치 기준 관찰에서도 나타났던 사이트 스크립트 오류(`ready`, `style` 접근 오류)는 최종 실행에서도 관찰되었다. 수집한 pageerror 중 chrome-extension 스택으로 식별된 오류는 없었다. 전체 콘솔 오류가 없다는 의미는 아니다.

화면 증거: [포럼 홈](forum-verification-2026-09-29/forum-home.png), [섹션](forum-verification-2026-09-29/forum-section.png), [토픽](forum-verification-2026-09-29/forum-topic.png), [검색](forum-verification-2026-09-29/search.png).

## 정리 증거

생성한 하위 에이전트 2개는 모두 작업을 마쳤다. 검증용 브라우저 4회는 각 소유 wrapper에 SIGINT를 전달하여 종료했고 모두 `cleanup: removed` 이벤트를 확인했다. 아래 정확한 프로필 루트가 없어졌고 각 CDP 포트가 닫혔으며 소유 wrapper/browser PID가 종료된 것을 추가 확인했다.

| 임시 루트 | CDP 포트 | 상태 |
|---|---:|---|
| `/tmp/codex-live-browser-sycvAz` | 43105 | 루트 제거·포트 닫힘·프로세스 종료 |
| `/tmp/codex-live-browser-iPVeXc` | 32811 | 루트 제거·포트 닫힘·프로세스 종료 |
| `/tmp/codex-live-browser-If4sMw` | 46791 | 루트 제거·포트 닫힘·프로세스 종료 |
| `/tmp/codex-live-browser-lEQ2Xv` | 43443 | 루트 제거·포트 닫힘·프로세스 종료 |

임시 서버는 만들지 않았다. 본 작업이 만든 `/tmp/mpkr-forum-finish-01a0ead9`의 스크립트·로그·ledger는 소비자가 종료된 뒤 제거했다. 공유 저장소, 기존 dirty 변경, 재사용한 브라우저/Node 실행 파일은 보존했다. 최신 확장 빌드와 검증 보고서·JSON·스크린샷은 결과물로 남겼다. 기계 판독 가능한 기록: [cleanup.json](forum-verification-2026-09-29/cleanup.json).
