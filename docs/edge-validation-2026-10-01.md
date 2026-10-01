# Desktop Edge 검증 기록

2026-10-01 KST. 미출시 개발 빌드의 구현·자동 검사·직접 관측·사용자 수동 확인을 구분한다. Edge Add-ons 출시 기록이 아니다.

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

## 자원 정리

소유 wrapper 세션 `52898`을 종료해 `cleanup: removed`를 확인했다. 소유 Edge 프로세스·탭·CDP endpoint와 임시 프로필 `codex-live-browser-jdbD8Y`가 정리됐다. 서버·하위 에이전트는 만들지 않았다. 사용자의 기존 브라우저·프로필은 연결하거나 닫지 않았고 기존 Chrome 출력은 읽기 전용으로 사용했다.

시작 시 wrapper가 발견한 다른 임시 루트 `codex-live-browser-56utLd`는 manifest가 없어 `preserved-ambiguous`로 남겼다. 이번 작업이 만든 자원이 아니므로 삭제하거나 소유 프로세스를 추측하지 않았다. 작업의 일회성 읽기 전용 probe·ledger는 종료 후 삭제하며, Edge 빌드·ZIP과 이 요약만 남긴다.

## 연결 문서

- [Edge 설치 안내](edge-installation.md)
- [개발·배포 명령](development.md#edge-기록-분리)
- [Notion Edge 작업 카드](https://www.notion.so/3ec58ad3a0b28165af9fe6c25b3f0778)
