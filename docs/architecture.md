# 프로젝트 구조

확장은 Mountain Project 페이지의 DOM을 읽어 고정 UI를 현지화하고, 지원 본문을 번역하며, 지도·목록·통계의 표시를 보완합니다. TypeScript로 작성한 DOM 구성요소를 WXT 콘텐츠 스크립트와 팝업에서 실행합니다.

## 모듈 구성

| 경로 | 책임 |
| --- | --- |
| [src/entrypoints/](../src/entrypoints/) | WXT 콘텐츠 스크립트·팝업 진입점과 의존성 조립 |
| [src/application/](../src/application/) | 설정 구독, ON/OFF, 페이지 기능 조립과 종료 |
| [src/core/](../src/core/) | 브라우저·사이트에 독립적인 설정·번역 인터페이스와 텍스트 정책 |
| [src/platforms/](../src/platforms/) | 브라우저 Translator API와 WebExtension 저장소 |
| [src/sites/mountain-project/contract/](../src/sites/mountain-project/contract/) | 지원 호스트·경로·지역 ID·selector·고정 문구 |
| [src/sites/mountain-project/dom/](../src/sites/mountain-project/dom/) | 페이지 구조 인식, 기능 적용 범위와 번역 대상 수집 |
| [src/localization/](../src/localization/) | 고정 UI 치환과 본문 번역 제어 |
| [src/rendering/](../src/rendering/) | 원본 DOM 보존, 번역문 표시·교체와 복원 |
| [src/ui/](../src/ui/) | 컨트롤 바, 팝업, 지역 목록, 지도·통계와 공통 스타일 |
| [test/](../test/) | 모듈·DOM·경계·출력 번들·배포 도구 테스트 |
| [public/](../public/) | 확장 아이콘과 제3자 고지 |
| [scripts/](../scripts/) | 패키지 검사와 배포 도구 |

공통 application과 core는 WXT 및 브라우저 전역 API에 직접 의존하지 않습니다. 콘텐츠 진입점에서 번역 provider, 설정 저장소, 페이지 application과 내비게이션 UI를 조립합니다. DOM을 사용하는 페이지 application은 각 문서의 `window`와 `document`에서 실행합니다.

## 시작과 설정

[content.ts](../src/entrypoints/content.ts)는 지원 호스트의 문서와 프레임에 `document_idle` 시점으로 주입됩니다. 비동기 시작 전에 WXT invalidation과 runtime 종료를 연결합니다.

[runtime.ts](../src/application/runtime.ts)는 다음 순서로 시작합니다.

1. 상단 컨트롤을 마운트합니다.
2. 설정 변경을 구독합니다.
3. 저장된 설정을 읽고 페이지를 활성화하거나 비활성화합니다.

설정은 [WebExtensionSettingsRepository](../src/platforms/webextension/settings-repository.ts)가 `storage.local.enabled`에 저장합니다. 키가 없으면 OFF와 첫 실행 상태를 적용하고 저장된 boolean 값은 유지합니다. 같은 브라우저 프로필의 열린 페이지·팝업은 저장소 변경 구독으로 설정을 맞춥니다.

ON 입력은 페이지 기능을 먼저 활성화한 뒤 설정을 저장합니다. 상단 스위치의 사용자 입력 흐름 안에서 번역 모델 준비를 시작하기 위한 순서입니다. OFF는 저장 완료나 저장소 변경 통지에 따라 적용합니다. 저장 실패는 더 최신 설정이 없을 때 이전 상태로 복원합니다.

초기 조회나 저장 완료가 늦게 도착해도 revision으로 최신 설정을 보존합니다. 첫 실행 상태는 설치 날짜가 아니라 설정 키의 부재로 판단하며 별도의 온보딩 완료 키를 저장하지 않습니다.

## 페이지 기능과 종료

[mountain-project-application.ts](../src/application/mountain-project-application.ts)는 페이지 종류와 DOM에 맞는 현지화·번역·UI를 조립합니다.

- `enable()`: 해당 페이지에서 지원하는 기능을 시작합니다.
- `disable()`: 페이지 기능, 삽입한 UI와 관찰자를 정리하고 원문·원래 화면을 복원합니다. 상단 컨트롤은 유지합니다.
- `destroy()`: 설정 구독, 상단 컨트롤과 페이지 기능을 모두 종료합니다.

늦게 완료되는 번역·네트워크 작업은 종료된 화면에 반영하지 않습니다. 프레임별 runtime과 부모의 임베드 보조 UI는 각자가 생성한 DOM을 관리합니다.

본문의 처리 흐름은 [번역 명세](translation-runtime.md), 구성요소의 표시와 조작은 [화면 구성](design-system.md)을 참고하세요.

## 페이지 지원 범위

| 페이지 | 현재 적용 범위 |
| --- | --- |
| `/` | 고정 UI와 대한민국 게이트웨이 |
| `/area/:id`, `/route/:id` | 유효한 공통 DOM에서 고정 UI, 작성 콘텐츠 자동 번역, 섹션 표시 개선. Area에는 현재 지역 지도, Route에는 통계 임베드 적용 |
| `/route/stats/:id` | 고정 UI, 등반 기록 메모 번역, 3열 요약과 전체 폭 등반 기록, 점진 목록 표시 |
| `/route-finder` | 검색 UI와 결과 설명 번역 |
| `/photo/:id` | 사진 설명과 댓글 번역 |
| `/user/...`, `/contact-user/...` | 프로필·기여·커뮤니티·연락 UI의 고정 문구 번역. 사용자 데이터 자체는 보존 |
| `/route-guide`, `/gyms` | 탐색·검색·목록 고정 UI 번역 |
| `/search`, `/partner-finder`, `/forum`, `/forum/topic/:id` | 지원 DOM의 검색·파트너·포럼 고정 UI와 작성 콘텐츠 번역 |
| `/gym/:id`, `/whats-new` | 고정 UI와 지원되는 댓글·게시글·활동 내용 번역 |
| `/help`, `/help/:id/:slug`, `/help-hub`, `/name-review-process` | 고정 UI, FAQ 질문·답변과 이름 검토 본문, 동적 검색 결과·시작하기 카드·주제 소개 번역. 기능 제안 제목·설명 자동 번역과 원문 확인·재번역, 필터·모달·알림 현지화. 작성자·투표 수·폼 입력값·카테고리 제출값·원본 동작 보존 |
| `/about` | 소개·연혁 본문 자동 번역, 제목·통계 라벨 현지화. 기여자·관리자 이름, 지역명, 순위·통계 숫자 및 링크 보존 |
| `/add/...`, `/edit/...`, `/suggest/...`, `/share/...` | 지원되는 지역·루트·사진·접근로·동영상·지도 심볼 기여 화면의 고정 라벨·안내·버튼·placeholder 번역. 입력값과 제출 데이터는 보존 |
| `/improvement/...`, `/updates/Climb-Lib-Models-...` | Area 안에 동적으로 삽입되는 페이지 개선 폼과 독립 개선·변경 내역 경로의 고정 UI 번역 |

메인 대한민국 게이트웨이, 한국 지역명 매핑과 Classic Routes 그룹화는 한국 범위에 적용합니다. Area 지도와 Route 본문·통계는 지역과 관계없이 지원 DOM을 확인해 적용합니다.

## 사이트 변경 대응

Mountain Project의 구조가 바뀌면 먼저 사이트 계약과 DOM locator를 확인합니다.

| 변경 대상 | 수정 위치 |
| --- | --- |
| 호스트·URL·페이지 분류 | `contract/origins.ts`, `contract/routes.ts` |
| 지역 ID·이름·목적지 | `contract/regions/`, `contract/directory-destinations.ts` |
| DOM 구조와 필수 요소 | `contract/selectors/`, `dom/` |
| 원문 UI와 한국어 대응 | `contract/text/` |
| 진단 형식 | `contract/schema.ts`, `contract/diagnostics.ts` |

계약 경로는 모두 `src/sites/mountain-project/` 기준입니다. URL만으로 기능을 적용하지 않고 필요한 DOM을 함께 확인합니다. 필수 요소를 찾지 못하면 해당 기능을 건너뛰며 개발자 콘솔에 계약 진단을 한 번 기록합니다.

지역 지도 기능의 공용 진입점은 [area-map-embed.ts](../src/ui/area-map-embed.ts)입니다. 구현 파일명은 `south-korea-map-embed.ts`지만 유효한 Area 페이지의 현재 지역을 표시합니다.

[test/boundary/](../test/boundary/)는 사이트 고유 값의 분산과 공통 코드의 플랫폼 의존을 검사합니다. 구조를 수정할 때는 변경된 페이지 fixture, 동적 DOM, OFF 복원과 관련 경계 테스트를 함께 확인합니다.
