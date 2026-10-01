# Desktop Whale 호환성 검증

검증일: 2026-10-01 KST. 정식 지원이나 스토어 출시가 아닌 미출시 호환성 프로토타입의 기록이다.

## 소스와 산출물

- 통합 출발점: `b54b66b884677555b6c0f4c62eae6beb70a4f8dc`, 제품 구현 기준 `e51e21e161171a1e4e403cdfbeb2277fc3482b43`.
- 이번 변경은 빌드·패키지 검사·배포 도구·회귀 테스트·문서다. 제품 `src/`, 버전 `0.1.0`, 의존성 및 권한은 변경하지 않았다. 이 문서와 함께 커밋되는 소스가 검증 대상이다.
- Whale 출력: `.output/whale-mv3`. ZIP: `.output/mountain-project-korea-extension-0.1.0-whale.zip`.
- manifest SHA-256: `b34b7d5bb639c94dd6e1a178eb8f62704dd62ee43d5936ce67c7a600998ce213`.
- content script SHA-256: `ed4cc58c64818c79c757943faed69a70d88ecebb2f04c39de6a55e2939c94477`.
- ZIP SHA-256: `1a8502089802fb16a10dd416dfed61e1d406de458100c1ecff035556cc1bf68f`.

## 자동 검사

- `npm run zip:whale`: 소스 타입 검사, WXT Whale MV3 빌드, manifest·권한·참조파일 검사, 출력 번들 smoke와 생성된 실제 ZIP 검사 통과.
- `npm run test:release`: 배포·패키지 검사 17개 통과. 잘못된 대상·MV·권한·참조와 receipt 브라우저 혼동을 거부하며 기존 Chrome schema 1도 검증한다.
- Chrome provider 및 Whale 호환성 집중 검사: 2개 파일·18개 통과. API 부재, availability 조회 실패·미지원, 원문·폼 보존, 일반 입력의 무한 재시도 방지, OFF 및 늦은 Promise 정리를 확인했다.
- `npm run typecheck:test` 통과. `npm test -- --maxWorkers=2` 전체 회귀는 64개 파일, 678개 검사 모두 통과했다. 이전 공통 소스 검증에서 실패했던 세 파일도 이번 전체 실행에서 통과했으며 테스트 코드의 제한 시간을 늘리지 않았다.
- `npm run zip`으로 기존 Chrome MV3 빌드·번들 smoke·ZIP 검사를, `npm run build:firefox`로 Firefox MV2 빌드·번들 smoke를 통과했다. 세 브라우저의 content script SHA-256은 위 값으로 동일하다. Chrome·Firefox 실브라우저를 이번 웨일 작업에서 다시 검증했다는 뜻은 아니다.

`release prepare` 전체 절차를 이번 저장소에서 실행하거나 스토어 후보 receipt를 발급한 것은 아니다. 도구 회귀 검사와 개발 ZIP 생성을 구분한다. API가 응답하지 않고 영구 pending인 경우의 타임아웃은 현재 구현에 없다.

## 실제 브라우저

- Whale **4.39.410.14**, CDP Chromium **150.0.7871.230**, Windows x64 환경. UA의 NT 10.0만 확인했으며 Windows의 정확한 제품명·OS 빌드는 판정하지 않았다.
- 설치된 버전 디렉터리의 실제 `whale.exe`를 사용하고 기존 사용자 계정·프로필과 분리된 새 임시 프로필에 unpacked 확장을 로드했다.
- `Translator` 객체는 존재하지만 `availability({ sourceLanguage: 'en', targetLanguage: 'ko' })`가 **unavailable**이었다. API 부재와 구별하며, 실제 영어→한국어 번역 성공이나 언어팩 다운로드 완료를 주장하지 않는다.
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

## 남은 범위

- Papago를 직접 활성화한 상태의 중복 번역·DOM 충돌은 미검증이다. 이번 실행에서는 내장 페이지 번역을 호출하거나 브라우저 설정을 변경하지 않았고 원래 영어 본문을 관찰했다. 자동 번역 설정값 자체는 읽지 않았다.
- 로그인한 기여 흐름·제출·실계정 데이터 변경은 수행하지 않았다. 폼 보존은 자동 테스트와 비로그인 화면 범위다.
- 실제 언어팩 준비·번역 성공은 현재 Whale 응답에서 확인할 수 없다. 외부 번역 서버나 비공개 Papago API를 도입하지 않았다.
- 패키징 성공을 Chrome과 같은 본문 번역 지원 또는 스토어 제출 준비 완료로 표시하지 않는다. 제한 기능 배포 여부와 추가 엔진 도입은 별도 결정이다.

## 자원 정리

구현·테스트·문서 에이전트 3개는 완료 후 종료했다. 정상 검증에 사용한 브라우저는 소유 wrapper를 통해 종료했고 `cleanup: removed`로 해당 임시 프로필 제거를 확인했다. 기존 사용자 프로필·세션은 재사용하거나 닫지 않았다.

처음 설치 루트의 시작기 `whale.exe`를 실행한 시도는 실제 프로세스 추적 전에 시작기가 종료됐고 임시 프로필의 `lockfile`이 잠겨 정리가 끝나지 않았다. 해당 임시 경로는 소유권·소비 프로세스 재확인이 필요해 강제 삭제·프로세스명 기반 종료를 하지 않았다. 복구용 소유권 기록만 `.tmp/whale-validation-2026-10-01/ownership.json`에 남긴다. 성공한 두 번째 실행에서는 버전 디렉터리의 실제 바이너리를 사용했다. 이 실패는 확장 설치나 번역 성공의 증거로 사용하지 않는다.

## 근거

- [WXT 브라우저별 타깃](https://wxt.dev/guide/essentials/target-different-browsers.html): 사용자 지정 browser와 명시적 MV3 빌드.
- [Whale 확장 API](https://developers.whale.naver.com/api/extensions/): Chrome API 호환 네임스페이스. 이것만으로 Translator 언어쌍 지원을 보장하지 않는다.
- [설치 안내](whale-installation.md), [배포 도구](development.md), [문서 대응표](documentation-sync.md).
