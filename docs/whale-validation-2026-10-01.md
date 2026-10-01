# Desktop Whale 호환성 검증

검증일: 2026-10-01 KST. 정식 지원이나 스토어 출시가 아닌 미출시 호환성 프로토타입의 기록이다.

## 공식 중단 결정 — 2026-10-01

사용자는 “공식적으로 웨일은 현재까지 하고 중단”하도록 결정했다. **현재 검증 수준에서 Whale 개발·추가 진단·검증·배포 준비를 중단한다.** 고정 제목·메뉴 한국어 표시와 일부 탐색 기능은 확인했지만 본문 자동 번역은 제공하지 못했다. 정확한 내부 원인이 미확정인 상태를 보존하며 모든 Whale 버전의 영구 미지원으로 일반화하지 않는다.

- 완료한 W1·W2와 기존 MV3 빌드·ZIP·검사 도구·소스·증거는 보존한다. 제품 버전·권한·데이터 흐름은 변경하지 않는다.
- W3·W4의 미완료 항목은 사용자 중단 사유와 함께 Notion 작업 큐의 **보관됨**으로 전환한다. 본문 번역·Papago 공존·네이티브 UI·스토어 준비를 완료 처리하지 않는다.
- 추가 서비스 원인 조사, 다른 Whale 버전·플래그 시험, Papago 공존/직접 연동, 외부·별도 번역 엔진, 제한 기능 배포·스토어 제출은 진행하지 않는다. 사용자의 명시적 재개 요청이 있어야 다시 착수한다.
- 아래 “진행 중”과 후속 제안은 중단 전 시점의 이력이다. 미검증 항목은 재개 시 참고자료로만 남긴다. 기존 사용자 브라우저와 다른 브라우저 담당 작업은 유지한다.

중단 반영은 문서·작업 상태 정리다. 본문 번역 기능을 수정하거나 브라우저를 다시 실행한 것이 아니며, 기존 통과 수치를 새 테스트 결과로 사용하지 않는다.

## 소스와 산출물

- 통합 출발점: `b54b66b884677555b6c0f4c62eae6beb70a4f8dc`, 제품 구현 기준 `e51e21e161171a1e4e403cdfbeb2277fc3482b43`.
- 최초 구현·검증 기준은 `3b830b560d792add7779e7631349d0d6fc613c9b`다. 빌드·패키지 검사·배포 도구·회귀 테스트·문서를 변경했으며 제품 `src/`, 버전 `0.1.0`, 의존성 및 권한은 유지했다. 아래 자동 검사 수치는 이 후보에 한정한다.
- Whale 출력: `.output/whale-mv3`. ZIP: `.output/mountain-project-korea-extension-0.1.0-whale.zip`.
- manifest SHA-256: `b34b7d5bb639c94dd6e1a178eb8f62704dd62ee43d5936ce67c7a600998ce213`.
- content script SHA-256: `ed4cc58c64818c79c757943faed69a70d88ecebb2f04c39de6a55e2939c94477`.
- ZIP SHA-256: `1a8502089802fb16a10dd416dfed61e1d406de458100c1ecff035556cc1bf68f`.

## 자동 검사

다음은 최초 후보 `3b830b5`의 결과이며, 같은 날 후속 세션에서 전체 검사를 반복하지 않았다.

- `npm run zip:whale`: 소스 타입 검사, WXT Whale MV3 빌드, manifest·권한·참조파일 검사, 출력 번들 smoke와 생성된 실제 ZIP 검사 통과.
- `npm run test:release`: 배포·패키지 검사 17개 통과. 잘못된 대상·MV·권한·참조와 receipt 브라우저 혼동을 거부하며 기존 Chrome schema 1도 검증한다.
- Chrome provider 및 Whale 호환성 집중 검사: 2개 파일·18개 통과. API 부재, availability 조회 실패·미지원, 원문·폼 보존, 일반 입력의 무한 재시도 방지, OFF 및 늦은 Promise 정리를 확인했다.
- `npm run typecheck:test` 통과. `npm test -- --maxWorkers=2` 전체 회귀는 64개 파일, 678개 검사 모두 통과했다. 이전 공통 소스 검증에서 실패했던 세 파일도 이번 전체 실행에서 통과했으며 테스트 코드의 제한 시간을 늘리지 않았다.
- `npm run zip`으로 기존 Chrome MV3 빌드·번들 smoke·ZIP 검사를, `npm run build:firefox`로 Firefox MV2 빌드·번들 smoke를 통과했다. 세 브라우저의 content script SHA-256은 위 값으로 동일하다. Chrome·Firefox 실브라우저를 이번 웨일 작업에서 다시 검증했다는 뜻은 아니다.

`release prepare` 전체 절차를 이번 저장소에서 실행하거나 스토어 후보 receipt를 발급한 것은 아니다. 도구 회귀 검사와 개발 ZIP 생성을 구분한다. API가 응답하지 않고 영구 pending인 경우의 타임아웃은 현재 구현에 없다.

## 실제 브라우저

- 최초 실행에서 Whale **4.39.410.14**, CDP Chromium **150.0.7871.230**, Windows x64를 확인했다. 당시 UA의 NT 10.0만 기록했으며, 같은 날 후속 호스트 조회에서 **Windows 11 Pro 25H2, OS 10.0.26200, 빌드 26200.9457, x64**를 확인했다. 후속 조회는 브라우저 재실행 결과와 구분한다.
- 설치된 버전 디렉터리의 실제 `whale.exe`를 사용하고 기존 사용자 계정·프로필과 분리된 새 임시 프로필에 unpacked 확장을 로드했다.
- `Translator` 객체는 존재하지만 `availability({ sourceLanguage: 'en', targetLanguage: 'ko' })`가 **unavailable**이었다. API 부재와 구별하며, 실제 영어→한국어 번역 성공이나 언어팩 다운로드 완료를 주장하지 않는다.
- 현재 본문 번역은 `ChromeTranslationProvider`의 Translator API를 사용하며 Whale의 내장 Papago 페이지 번역과 별개다. 고정 UI 한국어는 확장 내 문구 치환으로 제공한다. 최초 확인은 en→ko unavailable 응답까지였다. 이후 최소 재현·Chrome 비교에서 내부 번역 서비스 실패 계열로 범위를 좁혔으며 아래 추가 실진단에 기록한다.
- 최초 MP 메인에서 OFF·스위치 강조·암전을 확인했다. 상단 스위치 ON 클릭 후 활성화·설정 저장·안내 제거가 동작했고 저장 오류는 없었다.
- 실제 확장 popup 문서를 별도 탭에서 열어 페이지와 OFF/ON 동기화를 확인했다. OFF 저장 후 새로고침해도 OFF가 유지되고 온보딩이 재등장하지 않았으며 다시 ON으로 활성화됐다. 브라우저 툴바의 아이콘을 눌러 여는 네이티브 팝업 버블 동작까지 검증한 것은 아니다.
- High Exposure에서 OFF 전후 `.fr-view` 원문 내용과 원본 링크 목적지가 일치했고 통계 iframe·미지원 안내가 제거됐다. 다시 ON 하면 미지원 안내가 정상 복구됐다. South Korea의 지도 토글을 열어 원본 `/map/106225629/south-korea` iframe 생성을 확인했고 OFF 시 제거됐다. 지도 내 개별 정보 링크·새 창 이동을 이번 실환경에서 전수 검사한 것은 아니다.

| 페이지 | 확인 결과 |
| --- | --- |
| Main | 최초 OFF 안내, ON 후 공통 기능 활성화 |
| South Korea, Asia Area | core ready, 고정 UI 한국어, 본문 미지원 안내·원문 유지 |
| High Exposure Route | core ready, 원문 유지·미지원 안내, 통계 iframe 생성 |
| Forum Topic | core ready, 본문 원문과 미지원 안내 유지 |
| Partner Finder Results | `등반 파트너 찾기` 등 고정 UI, 원문·미지원 안내 |
| Help | `도움말 센터` 등 고정 UI |
| Add Photo | 비로그인 `가입 또는 로그인` 화면 현지화. 로그인한 사진 업로드 폼·업로드는 미검증 |

원문 본문에 기계 번역 결과를 표시한 페이지는 없었다. `core=ready`는 기능 조립 성공이지 본문 번역 성공이 아니다. 메인·루트·popup 캡처와 제한된 DOM 결과에서 위 사실을 확인했다. 기여 화면의 마지막 캡처는 시간 초과했으나 그 전에 기록한 DOM 조사와 별개다. 결과 요약 후 일회성 검사 스크립트·DOM 보고서·캡처는 정리하며 사이트 원문·이미지를 Git에 공개하지 않는다.

## 전용 세션 후속 확인

- 시작 HEAD는 `93b60ca244e042b5183e6aed3f0b7cd7e7dbc395`였다. Edge 담당의 공통 파일·문서 미커밋 변경이 있어 해당 파일과 공유 `.wxt/`, `.output/`, `node_modules/`를 변경하지 않았다. 제품 `src/`, `wxt.config.ts`, `package-lock.json`은 최초 후보 `3b830b5`와 차이가 없었다.
- 기존 manifest·content script·ZIP의 SHA-256이 위 기록과 일치했다. ZIP과 unpacked 폴더의 **10개 파일 전체를 바이트 단위로 대조해 일치**를 확인했다. 재빌드·전체 회귀·release prepare는 실행하지 않았으며 기존 통과 결과를 Edge 미커밋 변경의 검증으로 사용하지 않는다.
- 설치 실행파일 `C:/Program Files/Naver/Naver Whale/Application/4.39.410.14/whale.exe`의 존재와 FileVersion/ProductVersion `4.39.410.14`를 재확인했다. `Win32_OperatingSystem`의 제품·버전·아키텍처와 Windows `CurrentVersion`의 DisplayVersion/UBR을 읽어 위 OS 정보를 확인했다. 상위 디렉터리의 launcher는 실행하지 않았다.
- Windows UI 도구가 초기화 전에 `Mcp error -32602: codex/sandbox-state-meta: sandboxCwd is not a local file URI: file:///mnt/c/...`로 실패했다. JavaScript 커널 초기화 후 한 번 재시도해도 같은 오류였다. 이 세션의 WSL 작업 경로 처리 오류로 관측되며 확장 또는 Whale 기능 실패의 증거는 아니다.
- 새 브라우저·프로필·탭·CDP 연결을 만들지 않았다. 네이티브 툴바 popup, 실제 키보드 입력, 지도 정보 링크의 새 탭 동작을 실행하지 못했다. 소스의 native checkbox, 지도 Enter/Space 처리, 정보 링크 `_blank`/`noopener noreferrer`를 읽어 확인한 것은 실브라우저 통과를 대신하지 않는다.
- 로컬 Whale 문서와 Notion 허브·01~06·기존 W3/W4를 대조하고 W3/W4·05의 Whale 절에 후속 결과를 반영했다. 제품 지원 범위는 그대로이며 W3/W4는 진행 중이다. 정확한 OS·산출물 식별 항목만 완료로 보완하고 UI 미검증을 완료 처리하지 않았다. 이 후속 세션은 문서 편집이며 Git 커밋·push는 수행하지 않았다.

## Whale 방식의 번역 경로 조사

2026-10-01 사용자 요청으로 공식 Whale 도움말·현재 확장 API 목록·웨일팀 답변·공식 Papago API를 조사했다. 이는 문서와 소스 검토이며 실제 Papago ON 통과 결과가 아니다.

| 경로 | 확인한 근거 | MPKE 적용 판단 |
| --- | --- | --- |
| Whale 내장 사이트 번역 | [공식 도움말](https://help.whale.naver.com/ko/desktop/translate/)에 메뉴 번역·사이트별 자동 번역·원문 보기 제공 | 우선 검증할 공존안. 사용자가 브라우저에서 번역을 시작하고 확장은 고정 UI·지도·탐색 제공. 확장의 OFF와 Whale 원문 복원은 별도 |
| 확장에서 내장 Papago 직접 호출 | [현재 API 목록](https://whale.dev/api/extensions/)에 해당 공개 API를 찾지 못했고 [2019년 웨일팀 답변](https://forum.whale.naver.com/topic/22669/)도 미제공 안내 | 공식적으로 지원되는 직접 연동 경로를 확보하지 못함. 공개 API 미확인과 내부 API 부재를 구분 |
| 공식 Papago Text Translation API | [공식 명세](https://api.ncloud-docs.com/docs/ai-naver-papagonmt-translation)에 en↔ko·Client ID/Secret·번역문 응답, [사용 준비](https://guide.ncloud-docs.com/docs/papagotranslation-spec)에 과금 안내 | 별도 서버·키 보관·외부 텍스트 전송·비용 설계가 필요한 대안. 현재 범위에서 신청·호출·구현하지 않음 |

공존안의 소스 검토: `src/entrypoints/content.ts`는 현재 항상 `ChromeTranslationProvider`를 주입하고 `src/application/mountain-project-application.ts`는 본문 controller/renderer를 조립한다. 내장 번역은 `translate(text): Promise<string>`으로 응답을 받는 provider가 아니므로 성공을 가장하는 대체 provider로 연결하지 않는다. 구현한다면 조립부에서 브라우저가 본문을 관리하는 동작을 별도로 선택하고 본문 번역 controller/renderer의 쓰기·복원을 생략하며, 고정 UI·탐색과 내장 번역 안내를 유지하는 방안을 검토한다. 현재 코드를 변경한 것은 아니다.

`PageTranslationController`와 고정 UI localizer는 DOM 변화를 관찰하고 renderer는 일부 텍스트를 저장·복원하므로 Papago의 DOM 변경과 상호작용할 여지가 있다. 이는 소스 기반의 검증 필요성이지 재현된 결함이 아니다. 후속 최소 실검증은 확장→Papago 및 Papago→확장 두 순서에서 Area/Route 본문 한국어, 고유명·난이도 보존, 새 댓글, 지도 링크, 확장 OFF와 Whale 원문 보기의 독립 복원이다. 검증을 통과하기 전에는 병용 지원 완료·확장 스위치 하나로 본문 번역 제어를 약속하지 않는다.

## Translator unavailable 추가 실진단

앞선 UI 도구 실패와 별도로, 새 전용 프로필에서 일반 페이지·최소 진단 확장·Chrome 비교를 실제 실행했다. 시작 HEAD는 `f1488c900fdfcf70578d2306a88df7a5ec099a31`이며 제품 확장은 로드하지 않았다. 제품 소스·공유 빌드 산출물·일반 프로필 설정을 변경하지 않았고 재빌드·전체 회귀는 반복하지 않았다. [구조화된 증거](evidence/whale-translator-diagnosis-2026-10-01.json)에 관측값과 제한을 보존한다.

| 실제 실행 | 실행 환경 | en→ko / ko→en / en→fr | 추가 관측 |
| --- | --- | --- | --- |
| Whale 4.39.410.14, 로컬 진단 페이지 | 페이지 MAIN, 진단 확장 ISOLATED | 모두 `unavailable` | en→ko·en→fr `create()`는 `NotSupportedError`, 번역 서비스 오류 경고 |
| Whale 4.39.410.14, MP HTTPS 메인 | 진단 확장 MAIN, ISOLATED | 모두 `unavailable` | 동일 오류·경고. MPKE 제품 코드 없이 재현 |
| Chrome 154.0.8037.59, 같은 로컬 페이지 | 페이지 MAIN, 확장 없음 | 모두 `downloadable` | 모델 설치·번역 성공까지 실행한 것은 아님 |

모든 관측 문맥은 secure context, 문서의 translator Permissions Policy 허용, 표시 상태 visible이었고 선호언어에 `ko-KR, ko, en-US, en`이 있었다. 사용자 활성화는 false였다. `en→en`과 `en→zz`는 양쪽 브라우저 모두 unavailable인 음성 대조군이며 정상 언어쌍의 실패로 집계하지 않는다. HKCU/HKLM의 `SOFTWARE\Policies\Naver\Whale`에서 `TranslatorAPIAllowed` 값은 찾지 못했다. 다른 정책 경로·브라우저 유효 정책 전체가 없다고 판단한 것은 아니다.

Whale의 브라우저 경고는 `The on-device translation is not available.`와 `The translation service crashed.`였다. Chromium **150.0.7871.230** 공개 원본과 대조한 판단은 다음과 같다.

- [생성 전 가용성 검사](https://github.com/chromium/chromium/blob/150.0.7871.230/third_party/blink/renderer/modules/ai/on_device_translation/create_translator_client.cc#L222)는 사용자 활성화 검사보다 앞선다. 이번 `NotSupportedError`는 클릭 부족일 때의 `NotAllowedError`와 다르므로 버튼 위치나 MAIN world 주입만으로 해결된다고 볼 근거가 없다.
- [설치 상태 검사](https://github.com/chromium/chromium/blob/150.0.7871.230/components/on_device_translation/service_controller.cc#L327)는 단순 TranslateKit·언어팩 미설치를 다운로드 대기 상태로 반환한다. 따라서 이전의 “모델 미설치 때문에 unavailable” 추정은 확인된 원인으로 사용하지 않는다.
- [서비스 생성 요청](https://github.com/chromium/chromium/blob/150.0.7871.230/components/on_device_translation/service_controller.cc#L278)은 응답 callback 소실도 service crashed 범주로 처리한다. 관측은 **브라우저 내부 번역 서비스 실패 계열**까지 좁혀지며, OS 프로세스 충돌·라이브러리 누락·서비스 연결 실패 중 하나로 확정하지 않는다.

같은 Chromium 계열이어도 JS API 노출과 브라우저의 번역 서비스 제공은 별개다. 다만 공개 Chromium 원본을 Whale 내부 구현과 동일하다고 가정할 수 없으며, Chrome 154와 Whale Chromium 150은 엔진 버전까지 통제한 비교가 아니다. 현재 증거는 MPKE provider나 사이트 DOM 처리보다 Whale 내부 서비스 경로를 우선 조사할 근거다. 해결책이 없다는 결론이나 모든 Whale 버전의 미지원 판정은 아니다. 다음에 원인을 더 구분하려면 해당 버전의 서비스 시작·연결 진단 또는 다른 Whale 버전의 동일 최소 재현이 필요하다. 브라우저 업데이트·실험 플래그 변경은 이번에 실행하지 않았다.

첫 로컬 진단에서 추가 extension MAIN 스크립트의 전역 상수 이름이 겹치는 fixture 오류가 있었으나 페이지 MAIN과 ISOLATED는 끝까지 실행됐다. IIFE로 수정한 MP 진단에서는 두 문맥이 모두 완료됐다. MP의 별도 vendor 스크립트 오류는 로컬에서도 재현된 번역 실패의 근거로 사용하지 않았다. Windows UI 도구 오류는 여전히 남아 네이티브 Papago 조작·공존 검증이나 실제 클릭을 통한 번역 성공을 주장하지 않는다.

## 중단 시 미검증 범위

아래는 재개 시 참고할 미검증 항목이며 현재 진행 예정 작업이 아니다.

- 네이티브 툴바 popup의 열기·닫기·크기·페이지 동기화, Tab/Shift+Tab·Space/Enter 키보드 흐름, 실제 저장 실패, 지도 정보 링크의 새 탭 이동, 동적 댓글·모달은 미검증이다. 재개 시 Windows UI 연결 복구 후 해당 경계를 확인할 수 있다.
- Papago를 직접 활성화한 상태의 중복 번역·DOM 충돌은 미검증이다. 이번 실행에서는 내장 페이지 번역을 호출하거나 브라우저 설정을 변경하지 않았고 원래 영어 본문을 관찰했다. 자동 번역 설정값 자체는 읽지 않았다.
- 로그인한 기여 흐름·제출·실계정 데이터 변경은 수행하지 않았다. 폼 보존은 자동 테스트와 비로그인 화면 범위다.
- 실제 언어팩 준비·번역 성공은 현재 Whale 응답에서 확인할 수 없다. 외부 번역 서버나 비공개 Papago API를 도입하지 않았다.
- 패키징 성공을 Chrome과 같은 본문 번역 지원 또는 스토어 제출 준비 완료로 표시하지 않는다. 중단 결정에 따라 제한 기능 배포와 추가 엔진 도입도 진행하지 않는다.

중단 전 제안했던 실검증 순서는 네이티브 popup → 키보드 ON/OFF·페이지 동기화 → 지도 정보 링크였으며, Papago ON 공존과 로그인 기여 폼 확인도 남아 있었다. **2026-10-01 중단 결정으로 이 제안들의 실행과 제한 기능 배포를 멈춘다.** 재개 여부·범위는 사용자 결정으로 정하며 새 provider·스토어 후보·버전 변경을 진행하지 않는다.

## 자원 정리

구현·테스트·문서 에이전트 3개는 완료 후 종료했다. 정상 검증에 사용한 브라우저는 소유 wrapper를 통해 종료했고 `cleanup: removed`로 해당 임시 프로필 제거를 확인했다. 기존 사용자 프로필·세션은 재사용하거나 닫지 않았다.

처음 설치 루트의 시작기 `whale.exe`를 실행한 시도는 실제 프로세스 추적 전에 시작기가 종료됐고 임시 프로필의 `lockfile`이 잠겨 정리가 끝나지 않았다. 해당 임시 경로는 소유권·소비 프로세스 재확인이 필요해 강제 삭제·프로세스명 기반 종료를 하지 않았다. 복구용 소유권 기록만 `.tmp/whale-validation-2026-10-01/ownership.json`에 남긴다. 성공한 두 번째 실행에서는 버전 디렉터리의 실제 바이너리를 사용했다. 이 실패는 확장 설치나 번역 성공의 증거로 사용하지 않는다.

전용 후속 세션은 subagent·브라우저·프로필·서버·지속 command session을 만들지 않아 종료할 실행 자원이 없다. 기존 산출물과 사용자 브라우저, 이전 `56utLd` 프로필은 건드리지 않았다. 환경 조회·해시 대조·도구 실패를 기록한 `.tmp/whale-followup-2026-10-01/ownership.json`만 로컬 감사 근거로 보존한다.

추가 실진단의 브라우저 3회는 각각 소유 wrapper로 종료하고 임시 프로필 제거를 확인했다. 로컬 서버와 읽기 전용 소스 조사 에이전트도 종료했다. 진단 관측은 위 JSON에 추려 남기고 일회성 스크립트·DOM/로그 파일과 전용 임시 경로를 정리했다. 소유권 기록은 `.tmp/whale-translator-diagnosis-2026-10-01/ownership.json`에 남기며 이전 `56utLd` 경로는 변경하지 않았다.

## 근거

- [WXT 브라우저별 타깃](https://wxt.dev/guide/essentials/target-different-browsers.html): 사용자 지정 browser와 명시적 MV3 빌드.
- [Whale 확장 API](https://developers.whale.naver.com/api/extensions/): Chrome API 호환 네임스페이스. 이것만으로 Translator 언어쌍 지원을 보장하지 않는다.
- [설치 안내](whale-installation.md), [배포 도구](development.md), [문서 대응표](documentation-sync.md).
