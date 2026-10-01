# Desktop Edge 검증 기록

2026-10-01 KST. 미출시 개발 빌드의 구현·자동 검사·직접 관측·사용자 수동 확인을 구분한다. Edge Add-ons 출시 기록이 아니다.

현재 제출 버전은 사용자 요청에 따른 **0.1.1**이다. 아래 0.1.0 해시·소스·검사는 이전 후보의 이력으로 보존하며, 0.1.1에는 별도의 release receipt와 ZIP을 사용한다.

## 구현과 산출물

- 시작 HEAD: `3b830b560d792add7779e7631349d0d6fc613c9b`, 시작 작업 트리는 깨끗했다. Whale의 선행 변경을 보존했다.
- `build:edge`, `zip:edge`, `release prepare / verify --browser edge`를 추가했다. 공통 validator가 Edge를 허용하며 release는 `zip:edge`와 Edge 체크리스트를 명시적으로 선택한다. Chrome·Whale 명령과 기존 Chrome schema 1 기록 호환성은 유지한다.
- 개발 빌드 `.output/edge-mv3`, ZIP `.output/mountain-project-korea-extension-0.1.0-edge.zip`, 향후 배포 기록 `.output/releases/edge/<버전>/`를 구분했다.
- `src/`, WXT 설정, 의존성·권한·패키지 버전 `0.1.0`은 변경하지 않았다. 기존 `ChromeTranslationProvider`의 API 기능 감지와 WebExtension 설정 adapter를 재사용한다.
- manifest SHA-256: `b34b7d5bb639c94dd6e1a178eb8f62704dd62ee43d5936ce67c7a600998ce213`.
- content script SHA-256: `ed4cc58c64818c79c757943faed69a70d88ecebb2f04c39de6a55e2939c94477`.
- Edge ZIP SHA-256: `1a8502089802fb16a10dd416dfed61e1d406de458100c1ecff035556cc1bf68f`.
- 기존 Chrome 출력과 새 Edge 출력은 파일 10개 전체의 경로·내용이 동일했다. ZIP·폴더 이름으로 브라우저 산출물을 구분한다. 동일 바이트라는 사실만으로 프로필별 모델 상태가 같다고 판단하지 않는다.

## 자동 검사

- `npm run test:release`: 21/21 통과. Edge가 Whale ZIP 명령을 선택하지 않는지, 세 브라우저 기록의 분리, 다른 브라우저 receipt·ZIP 이름·검사 목록·Chrome 스토어 ID 거부와 실패 시 기록 미발급을 확인했다.
- `npm run zip:edge`: 소스 타입 검사, WXT Edge MV3 빌드, manifest·권한·참조 파일 검사, 출력 번들 smoke, 실제 생성 ZIP 검사 통과.
- Edge 출력의 `package-verified.mjs` 검사 통과. smoke는 Route·Area 및 기존 비로그인 기여 fixture의 시작·OFF/ON·재주입을 검사하며 실제 Edge 클릭 검증과 다르다.
- provider·settings repository·runtime·popup settings·first-run onboarding 집중 검사: 5개 파일, 37/37 통과. 모델 준비 호출의 동기 경계, API 상태·실패, 저장된 ON/OFF, 저장 경쟁과 popup 계약을 확인했다.
- 기존 `whale-compatibility.test.ts`의 공통 runtime fallback 검사 4/4 통과. API 부재·availability 오류·미지원 언어쌍에서 원문·링크·폼 입력 보존, 미지원 안내·재시도 제한·OFF 복원·늦은 준비 정리를 확인했다. Edge 실브라우저에 실패를 강제로 주입한 검사가 아니다.
- `git diff --check` 통과. 이 초기 구현 검증 단계에서는 전체 회귀, Firefox 재빌드, 실제 `release prepare`와 스토어 후보 receipt 발급을 수행하지 않았다. 후속 제출 준비의 전체 검사 결과와 확정 소스·ZIP은 `.output/releases/edge/0.1.0/release.json`을 기준으로 확인한다.

## 직접 관측한 실제 Edge

설치된 Windows x64 Edge **154.0.4258.37**을 `live-browser-dev` 소유 wrapper로 실행했다. 새 임시 프로필에 기존 `.output/chrome-mv3`를 로드하고, 소유권·CDP identity를 검증한 읽기 전용 probe를 사용했다. 플래그·브라우저 번역 설정은 변경하지 않았다.

| 항목 | 직접 관측 |
| --- | --- |
| Main 첫 실행 | 확장 스위치가 unchecked인 OFF, 스위치 강조와 활성화 안내, 대한민국 링크 표시 |
| South Korea Area | ON 스위치, 첫 실행 안내 해제, `대한민국 (South Korea) 클라이밍` 고정 UI |
| Translator | 기본 페이지와 확장의 isolated content script context 모두 `function`, en→ko `downloadable`, secure context |
| 본문 준비 | 소유 임시 프로필에서는 준비 대기 안내가 마지막 관측까지 유지됨. 기계 번역 body·원문·재번역 버튼은 직접 관측하지 못함 |

Computer Use `node_repl`은 `sandboxCwd is not a local file URI: file:///mnt/c/...` 오류로 초기화되지 않았다. 제공 도구에는 cwd 변환 인자가 없었다. 클릭·탐색·팝업 조작을 다른 UI 자동화 경로로 우회하거나 CDP에서 사용자 제스처를 만들어내지 않았다.

## 사용자 수동 확인

같은 Edge 작업 대화에서 사용자가 다음 결과를 직접 확인했다.

- 상단 ON·대한민국 이동 후 동작 정상.
- 대한민국 페이지에서 한국어 본문과 원문 보기·재번역 버튼 표시.
- **Edge 브라우저가 맞으며**, 원문 보기·재번역·팝업 OFF/ON·새로고침 후 설정 유지 모두 정상.
- 대한민국 지도, 루트 본문 번역과 루트 통계 모두 정상.

이 결과는 사용자 수동 확인이다. 연결된 임시 프로필은 준비 대기로 관측되어, 수동 확인 창과 동일한 프로필·확장 설치 ID·산출물이었는지는 확정하지 못했다. 사용자 결과를 부정하거나 임시 프로필의 직접 번역 성공으로 바꾸지 않는다. 모델 다운로드 진행률·완료 이벤트, 통계가 표시된 정확한 Route URL, iframe 내부 탐색 전수 검사는 수집하지 않았다.

## 사용자 관점 결과와 남은 확인

Edge에서 설치·갱신할 폴더와 ZIP을 명확히 제공하고, 브라우저별 배포 파일을 혼동하지 않도록 했다. 사용자는 기존 공통 기능의 본문 번역·원문·재번역·설정 유지·지도·통계가 Edge에서 정상이라고 확인했다. 새 권한·외부 번역 서버·별도 계정 흐름은 추가하지 않았다.

최종 제출 ZIP의 수동 확인은 남아 있다. 사용자가 해당 ZIP을 풀어 Edge에 로드한 뒤 번역·원문·재번역·OFF 복원·popup·지도·통계를 확인하면 제출 후보의 실검증으로 기록할 수 있다. 자동 클릭 도구 복구나 같은 임시 프로필의 재현은 스토어 제출의 필수 조건이 아니다. API 미지원·실패의 원문 보존은 자동 검사와 실제 상태를 구분한다. 로그인·기여 제출·실계정 데이터 변경·스토어 계정 생성·심사 제출·공개 배포는 수행하지 않았다.

후속 사용자 요청에 따라 Edge Add-ons 제출 준비로 범위를 확장했다. 개발자 등록은 아직 하지 않았다는 사용자 답변을 받았다. [제출 키트](edge-addons-submission.ko.md)에 계정 등록·필드별 문안·권한과 데이터 설명·심사자 안내를 정리했다. 제출 전 최종 패키지 결과는 위 배포 receipt와 함께 확인한다.

## 최종 제출 후보 준비 — 후속 실행

소스 [f1488c9](https://github.com/jeongjong10/mountain-project-korea-extension/commit/f1488c900fdfcf70578d2306a88df7a5ec099a31)를 고정한 clean clone에서 실제 `release prepare --browser edge`와 `release verify 0.1.0 --browser edge`를 통과했다. [배포 기록 원본 사본](evidence/edge-release-0.1.0-2026-10-01.json)에 커밋·검사 명령·manifest·파일 해시를 보존한다. 이후 결과 문서 커밋은 패키지 입력 커밋과 구분한다.

- `npm ci`, 소스·테스트 타입 검사, 배포 도구 21/21, 전체 Vitest 64파일·678/678(`--maxWorkers=4`), Edge MV3·content script smoke·실제 ZIP 검사 통과. 전체 회귀는 단일 실행에서 모두 통과했다.
- 첫 clean clone 시도는 테스트 출력용 `.tmp`가 없어 레이아웃 suite 준비 단계에서 실패했다(676개 통과, 2개 미실행). `test/ui/navigation-controls.layout.test.ts`가 디렉터리를 직접 생성하도록 고친 뒤 전체 prepare를 다시 통과했다. 실패한 실행에 receipt를 발급하지 않았다.
- 최종 ZIP은 `.output/releases/edge/0.1.0/mountain-project-korea-extension-0.1.0-edge.zip`, 139,673 bytes다. SHA-256은 앞선 개발 ZIP과 같은 `1a8502089802fb16a10dd416dfed61e1d406de458100c1ecff035556cc1bf68f`다. 압축 CRC 및 복사 후 10개 파일의 해시를 재확인했다.
- 같은 폴더의 `unpacked/`는 이 ZIP을 그대로 푼 확인용 사본이고 `submission/`에는 복사용 문안 8개, 안내 1개, 아이콘 1개, 기존 공통 UI 이미지 2개가 있다. `prepare.log`, 첫 실패 로그와 `npm-audit.json`은 개발 검증 기록이며 스토어에 업로드할 파일이 아니다.
- `b599db0`(Edge 패키징·제출 문안·개인정보 반영)과 `f1488c9`(clean checkout 테스트 준비 수정)를 GitHub main에 푸시했다. 진행 중인 다른 브라우저 변경은 이 커밋들에 포함하지 않았다.
- 공개 개인정보처리방침은 같은 URL의 Sites 버전 4로 갱신됐다. Edge의 기기 내 번역·브라우저 모델 다운로드와 Chrome 최초 공개판/Edge 후보의 ON·OFF 차이를 명시했다. 사이트 소스 `e626a58117baa59334451472e80a9aa4fff340c5`, 게시 상태 `succeeded`를 확인했다.

개발 의존성 점검: `npm audit`은 테스트 전용 `happy-dom` critical 1개와 `vitest`·`@vitest/mocker` moderate 2개 패키지를 보고했다. 이들 도구는 제품 `src/`에서 사용하지 않고 배포 ZIP에 포함하지 않는다. 테스트 의존성의 메이저 업데이트는 후속 유지보수로 남기며 보안 경고 0이라고 기록하지 않는다. Happy DOM은 신뢰하지 않는 스크립트 실행에서 VM 이탈 위험이 있으며, 번들 smoke는 외부 JS·CSS·iframe 로드를 끄고 fetch를 차단한다. [Happy DOM 권고](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-37j7-fg3j-429f), [Vitest 권고](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9).

현재 상태는 **제출 파일 준비 완료, Edge Add-ons 미제출·미공개**다. 개발자 등록·최종 ZIP의 사용자 확인·Partner Center 입력과 Publish·심사 결과 확인은 남아 있다. 앞선 수동 확인 결과는 유지하며 새 자동 클릭 성공이나 최종 ZIP의 사용자 설치 완료로 바꾸지 않는다.

## 자원 정리

소유 wrapper 세션 `52898`을 종료해 `cleanup: removed`를 확인했다. 소유 Edge 프로세스·탭·CDP endpoint와 임시 프로필 `codex-live-browser-jdbD8Y`가 정리됐다. 서버·하위 에이전트는 만들지 않았다. 사용자의 기존 브라우저·프로필은 연결하거나 닫지 않았고 기존 Chrome 출력은 읽기 전용으로 사용했다.

시작 시 wrapper가 발견한 다른 임시 루트 `codex-live-browser-56utLd`는 manifest가 없어 `preserved-ambiguous`로 남겼다. 이번 작업이 만든 자원이 아니므로 삭제하거나 소유 프로세스를 추측하지 않았다. 작업의 일회성 읽기 전용 probe·ledger는 종료 후 삭제하며, Edge 빌드·ZIP과 이 요약만 남긴다.

## 연결 문서

- [Edge 설치 안내](edge-installation.md)
- [개발·배포 명령](development.md#edge-기록-분리)
- [Notion Edge 작업 카드](https://www.notion.so/3ec58ad3a0b28165af9fe6c25b3f0778)
