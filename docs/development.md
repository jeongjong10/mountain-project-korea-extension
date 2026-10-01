# 개발 및 유지보수 안내

현재 소스의 구현 범위와 후속 개발을 위한 기술 문서입니다. 최초 OFF·스위치 강조·자동 번역 준비와 배포 도구는 공개된 `0.1.0` 이후의 미출시 변경입니다. 패키지 버전은 아직 `0.1.0`이며 이번 문서 동기화는 버전 변경이나 스토어 배포가 아닙니다. 제품 소개는 [README](../README.md), 최신 심사·게시 상태는 [출시 현황](release-status.md)을 참고하세요. 날짜가 붙은 검증 결과는 해당 시점의 소스와 환경에 한정됩니다.

## 기능별 구현 범위

아래는 현재 코드에 구현된 범위입니다. 페이지 구조와 브라우저 환경에 따라 적용 범위가 달라지며, 사이트 전체의 번역이나 모든 기능의 호환성을 보장하지 않습니다.

| 영역 | 구현 내용 |
| --- | --- |
| 공통 UI | 내비게이션, 버튼, 폼 안내, 클라이밍 용어 등 고정 문구 한국어화 |
| 공통 내비게이션 | 사용자 메뉴 앞의 통합 컨트롤 바: 확장 기능 ON/OFF 스위치와 대한민국 Area 퀵링크. 비로그인에서도 표시하고 팝업과 설정 동기화 |
| 지역 디렉터리 | `#route-guide`에 아시아·유럽·아메리카 탭. 대한민국 6개 권역과 해외 15개국·65개 지역. 등록 수는 버튼을 눌렀을 때만 조회. 아메리카 원본 보존 및 OFF 복원 |
| 메인 페이지 | 대한민국 클라이밍 지역으로 이동하는 진입 영역 |
| 한국 지역 탐색 | 지역명 현지화, 지역 목록 정렬, 설명 접기·펼치기, Classic Routes 그룹화와 사진 표시 개선 |
| 본문·댓글 | 전역 Area·Route·Route Finder·Photo의 지원 DOM에서 설명·접근·장비 정보, 사진 설명·댓글 등 번역 대상 처리와 동적 콘텐츠 대응 |
| 원문 확인·재번역 | 번역된 본문 섹션에서 원문 보기·숨기기와 해당 섹션 재번역. 실패 시 원문 유지와 수동 재시도 제공 |
| 지도 | 현재 Area의 지도 임베드, 지도 섹션 접기·펼치기, 지도 내 루트 링크 새 탭 열기 |
| 루트·통계 | 루트 통계 임베드와 표시 개선, 통계 페이지 현지화, 원본 `Show More` 보존, 목록 점진 표시와 화면 근접 등반 기록 번역 |
| 검색·사용자 페이지 | Route Finder, 사용자 프로필·기여·커뮤니티·연락 페이지의 고정 UI 현지화 |
| 탐색·커뮤니티 페이지 | Route Guide, 짐 목록·상세, 새 소식, 파트너 찾기, 포럼 목록·토픽의 지원 고정 UI 현지화 |
| 도움말 센터 | 기존 Help FAQ, 동적 Help Hub 검색·탭·폼 UI 현지화와 FAQ·이름 검토 문서 자동 번역. Feature Request 제목·설명 자동 번역과 원문 확인·재번역. 작성자·투표 수·폼 입력값 보존 |
| 기여·페이지 개선 | 지역·루트·사진·접근로 등 추가·편집·제안 화면의 고정 폼 UI 현지화. Area에서 AJAX로 열리는 `이 페이지 개선`, `새 지역과 루트 FAQ` 모달과 변경 내역 화면 대응. 작성값·제출값·폼 목적지는 변경하지 않음 |
| 탐색 편의 | 지원되는 왼쪽 사이드바 접기·펼치기, 루트 목록의 링크 영역과 키보드 포커스 표시 개선 |
| 설정·복원 | 상단 컨트롤 바·팝업에서 확장 기능 ON/OFF, 활성화 설정 저장. OFF 시 페이지 기능을 복원하되 컨트롤 바와 퀵링크는 유지 |

Area 지도와 Route 설명·위치·보호장비 섹션 UI는 전역으로 적용됩니다. 지도는 현재 Area를 가리키며, 유효한 지도 배치 구조가 필요합니다. 메인 대한민국 게이트웨이, 대한민국 최상위 목록과 한국 전용 큐레이션·그룹화는 기존 한국 범위를 유지합니다.

### 상단 컨트롤 바

상단 사용자 메뉴 바로 왼쪽에 **확장 기능 스위치 → 대한민국 링크 → 사용자 메뉴** 순서로 표시합니다. 비로그인에서는 Sign In 메뉴 앞에 배치합니다. ‘확장 기능’은 번역뿐 아니라 지도·통계 표시, 섹션·목록·사이드바 등 적용 가능한 페이지 편의 기능을 함께 제어합니다.

- 현재 제품은 다크 색상의 통합 컨트롤 바를 사용합니다. 어두운 중성 바탕·흰 글자·밝은 파란색 조작부를 사용합니다. [현재 디자인 기준과 시안](design-system.md)
- OFF로 바꾸면 페이지 기능을 중단·복원하지만, 다시 켤 수 있도록 컨트롤 바와 대한민국 링크는 남습니다. 대한민국 링크는 중앙 계약의 South Korea Area URL로 같은 탭에서 이동합니다.
- 본문 번역 준비·미지원·provider 실패가 발생하면 해당 본문 근처에 안내합니다. 보호 토큰·구조 검사로 거부한 결과는 `preserved`로 원문을 조용히 유지하며, 일반 오류와 구분합니다. 정상 번역 중에는 안내를 표시하지 않습니다. [표시 조건과 동작](translation-status-notice.md)
- 팝업은 다크 색상과 KOREA 아이콘을 사용하며 대한민국 지역·사용 안내·문의 링크를 제공합니다. 설정 조회·저장 실패를 표시합니다. 팝업 적용 결과 (로컬 참고: `design/review/popup-applied.html`)
- 상단 스위치와 팝업의 **확장 기능** 설정은 같은 `storage.local.enabled`를 사용합니다. 키가 없으면 기본 OFF와 첫 실행 스위치 강조 안내를 적용합니다. 기존 boolean 저장값은 유지하지만, 이전 설치도 설정을 저장하지 않았거나 키를 삭제했다면 첫 실행으로 처리합니다. 같은 브라우저 프로필에서 실행 중인 페이지·팝업은 저장소 변경 구독으로 함께 반영합니다. 기기 간 클라우드 동기화는 아닙니다.
- 상단 ON 입력은 저장을 기다리기 전에 기능을 활성화합니다. 메인·본문 번역 지원 페이지에서는 번역 준비도 시작하며 메인은 준비만 시도하고 본문 컨트롤러를 시작하지 않습니다. 설정 저장 성공에 따라 강조 안내가 사라지며, 엔진 준비 성공을 기다리는 흐름은 아닙니다. 팝업 ON은 설정만 전파하므로 콘텐츠 페이지에 다운로드를 위한 사용자 활성화가 전달된다고 보장하지 않습니다.
- 로그인 상태 변화나 헤더 교체 시 인식 가능한 사용자 메뉴를 다시 찾아 삽입합니다. 원본 아바타 클릭 영역·메뉴 노드는 유지합니다. 인식 가능한 헤더가 없는 페이지에는 컨트롤 바를 삽입하지 않습니다.

[컨트롤 바 구현·검증 문서](navigation-control-bar.md) · 최종 디자인 미리보기 (로컬 참고 파일: `previews/navigation-designs.html`)

### 페이지 지원 매트릭스

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

페이지 경로만 일치한다고 무조건 변경하지 않습니다. 각 기능은 필요한 DOM landmark를 찾은 경우에만 적용하고, 찾지 못하면 해당 기능을 건너뛰고 개발자 콘솔에 계약 진단을 한 번 기록합니다.

### 번역 방식과 범위

- **고정 UI·용어:** 확장에 포함된 번역 사전과 규칙으로 처리합니다.
- **고유명사·기술 표기:** DOM에서 확인한 루트명·지역명·사용자명과 등급, URL, 이메일, GPS, 장비 규격을 요청별 토큰으로 보호합니다. 토큰이 변형·누락·중복되면 해당 번역을 폐기하고 원문을 유지합니다. 한국 지명은 등록된 매핑이 있을 때만 한국어화합니다.
- **본문 번역 전처리:** 일반 클라이밍 용어·구절을 고정 한국어로 치환하던 경로는 제거했습니다. DOM에서 확인한 고유명사와 구현된 기술 값 패턴·문서 구조 토큰을 보호하고, 일반 본문은 번역 엔진이 문맥에 따라 처리합니다. 고정 UI 사전은 별도로 유지하며 현재 정책 버전은 `mpkr-policy-5`, 용어 정책 버전은 `mpkr-climbing-ko-3`이며 캐시 키에 포함됩니다. 일반 본문 용어집 토큰과 그 fallback 재호출은 사용하지 않습니다.
- **사용자 작성 콘텐츠:** 지원 대상에서 Chrome `Translator` API가 사용 가능하면 비동기로 자동 번역합니다. 유효한 Area·Route·Route Finder·Photo는 지역에 관계없이 본문·댓글 번역을 지원합니다. Route Stats 등반 기록, Gym 댓글, What's New 활동 댓글, Forum Topic 게시글, Help FAQ와 이름 검토 문서도 지원 DOM에서 번역합니다. User·Contributions·Community·Contact는 고정 UI만 번역합니다. Help Hub의 Feature Request 제목·설명은 원문 보기·재번역을 제공하며 자동 번역합니다. 작성자·투표 수·폼 입력값과 원본 데이터는 보존합니다.
- **원문 확인·재번역:** 블록형 본문과 댓글은 번역문을 기본으로 표시하고 섹션 단위로 원문을 전환하거나 캐시를 우회해 다시 번역할 수 있습니다. 재번역 중에는 기존 번역을 유지하며, 결과가 같거나 실패하면 상태를 알리고 원문·기존 번역을 잃지 않습니다. 고정 UI와 DOM에 직접 치환하는 짧은 인라인 문구는 이 컨트롤 대상이 아닙니다.
- **긴 댓글과 작성 형식:** 댓글의 루트 레벨 빈 줄을 원문 문단 경계로 사용해 순차 번역하고, 모든 문단이 성공한 뒤 한 번에 표시합니다. 링크·강조·목록·줄바꿈은 안전한 구조 토큰으로 보존하며, 복원 무결성이 깨지면 번역을 적용하지 않습니다.
- **대량 목록:** Route Stats는 현재 로드된 원본 데이터만 사용합니다. 등반 기록은 화면에 보이거나 가까운 항목부터 번역하고, 목록을 점진적으로 표시한 뒤 Mountain Project의 원본 `Show More`로 다음 묶음을 불러옵니다.
- **기여 폼:** 기여·개선 화면은 사전에 등록된 고정 UI와 안내문만 직접 번역합니다. 사용자가 작성한 `input`·`textarea` 값, 암묵적 제출값이 될 수 있는 `option`, 폼 `action`·`name`과 서버용 submit 값은 번역하지 않습니다. Area에 AJAX로 추가되는 개선 모달도 같은 규칙을 적용합니다.
- **최초 언어팩 준비:** 메인·본문 번역 지원 페이지의 상단 ON 입력의 동기 흐름에서 Chrome `Translator.create()`를 호출하고 결과는 비동기로 기다립니다. 메인 외 고정 UI 전용 페이지는 준비를 호출하지 않습니다. 이미 저장된 ON이나 팝업 ON으로 들어온 본문 페이지에서 사용자 동작이 더 필요하면 일반 클릭·키 입력으로 자동 재시도합니다. 별도의 `번역 준비 시작` 버튼은 표시하지 않습니다. 설정 저장 성공과 언어팩 준비 완료는 별개입니다.
- **번역 불가·실패:** 원문을 유지합니다. 고정 UI 번역과 본문 기계 번역은 별도로 동작합니다.

## 브라우저별 범위

| 브라우저 | 현재 범위 |
| --- | --- |
| Chrome | 주 개발 대상. MV3 빌드와 내장 번역 API 연동 코드가 있습니다. 실제 본문 번역은 API 제공 여부와 언어팩 상태에 따라 달라집니다. |
| Desktop Whale | 별도 MV3 툴바 빌드·ZIP을 제공하는 미출시 호환성 프로토타입입니다. 공통 코드를 재사용하며, 본문 번역은 실행 환경의 `Translator` API와 영어→한국어 가용성에 달려 있습니다. Chromium·Papago 지원만으로 번역 동등성을 가정하지 않습니다. [설치 안내](whale-installation.md) · [검증 범위](whale-validation-2026-10-01.md) |
| Firefox Desktop | MV2 빌드와 공통 WebExtension 설정을 제공합니다. 전용 본문 번역 엔진은 아직 구현되지 않았으며, 고정 UI와 탐색 기능은 별도 실사용 검증이 필요합니다. |
| Firefox Android | 장기 정식 Android 지원 경로입니다. `gecko_android` 매니페스트 설정은 포함되어 있지만 모바일 실기기 검증은 완료되지 않았습니다. |
| Android Yandex | Chrome 계열 빌드의 빠른 모바일 호환성 실험용이며 정식 지원 플랫폼이 아닙니다. |
| Safari Web Extension | 장기 iOS/iPadOS 지원 경로입니다. 공통 application·site contract 재사용 경계만 준비되어 있고 전용 빌드·provider·실기기 검증은 아직 없습니다. |
| WebView | 공통 runtime과 port를 호스트에 연결할 수 있도록 경계를 분리했습니다. 실제 앱 shell과 bridge는 구현되지 않았습니다. |

## 로컬 설치 및 실행

Node.js와 npm이 필요합니다. 프로젝트에는 Node.js `22.23.2`가 개발 의존성으로 지정되어 있습니다. 아래 예시는 WSL 또는 Linux/macOS의 셸 기준입니다.

```bash
git clone https://github.com/jeongjong10/mountain-project-korea-extension.git
cd mountain-project-korea-extension
npm ci
npx wxt prepare
npm run build
```

### Chrome에 개발 빌드 설치

1. Chrome 주소창에서 `chrome://extensions`를 엽니다.
2. **개발자 모드**를 켭니다.
3. **압축해제된 확장 프로그램을 로드합니다**를 선택합니다.
4. 프로젝트의 `.output/chrome-mv3` 폴더를 선택합니다.
5. [Mountain Project](https://www.mountainproject.com/) 또는 [South Korea](https://www.mountainproject.com/area/106225629/south-korea)를 엽니다. 저장된 설정이 없으면 OFF로 시작하므로 강조된 상단 **확장 기능** 스위치를 켭니다. 저장된 ON/OFF가 있으면 해당 상태를 유지합니다.

이미 열려 있던 페이지는 새로고침하세요. 코드를 변경하고 다시 빌드한 경우 확장 관리 화면에서 확장을 새로고침한 뒤 해당 페이지도 새로고침합니다.

### Whale에 개발 빌드 설치

`npm run build:whale`로 `.output/whale-mv3`를 생성하고, 별도 개발 프로필의 `whale://extensions`에서 개발자 모드를 켜 해당 폴더를 로드합니다. Chrome 빌드 폴더와 혼용하지 않습니다. 업데이트·최초 OFF·번역 미지원 안내 및 Papago와의 구분은 [웨일 설치 안내](whale-installation.md)를 따릅니다. 사용자 일반 프로필의 설정이나 번역 플래그는 자동으로 변경하지 않습니다.

### Firefox에 임시 설치

```bash
npm run build:firefox
```

Firefox의 `about:debugging#/runtime/this-firefox`에서 **임시 부가 기능 로드**를 선택하고 `.output/firefox-mv2/manifest.json`을 엽니다. 개발용 임시 설치는 브라우저를 종료하면 해제됩니다.

## 개발 및 검증

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | Chrome 개발 모드 |
| `npm run dev:firefox` | Firefox 개발 모드 |
| `npx wxt prepare` | WXT 타입·설정 생성. 최초 설치 후 타입 검사 전에 실행 |
| `npm run typecheck` | WXT 설정 생성 후 프로덕션 TypeScript 타입 검사 |
| `npm run typecheck:test` | 테스트 TypeScript 타입 검사 |
| `npm run check` | 프로덕션·테스트 타입 검사와 전체 테스트 실행 |
| `npm test` | Vitest 테스트 실행 |
| `npm run build` | 타입 검사 → Chrome 빌드 → 완성된 content script 실행 검사 |
| `npm run build:firefox` | 타입 검사 → Firefox 빌드 → 완성된 content script 실행 검사 |
| `npm run build:whale` | 타입 검사 → Whale MV3 빌드 → 패키지 manifest·로컬 참조 검사 → content script 실행 검사 |
| `npm run zip` | 타입 검사 → Chrome MV3 빌드 → 패키지·content script 검사 → ZIP 생성·실제 ZIP 검사 |
| `npm run zip:whale` | 타입 검사 → Whale MV3 빌드 → 패키지·content script 검사 → ZIP 생성·실제 ZIP 검사 |
| `npx wxt zip -b firefox` | Firefox 배포용 ZIP 생성 |
| `npm run test:release` | 배포 도구·공통 패키지 검사의 Node 테스트 실행. `npm test`·`npm run check`에는 포함되지 않음 |
| `npm run release -- version <버전>` / `prepare` / `verify <버전>` | 공통 버전 갱신 / Chrome 검증·ZIP 기록 생성 / Chrome ZIP 재확인 |
| `npm run release -- prepare --browser whale` | 깨끗한 커밋을 검증하고 Whale ZIP·별도 배포 기록 생성 |
| `npm run release -- verify <버전> --browser whale` | 준비한 Whale 기록과 현재 소스·버전·ZIP 재확인. 재빌드하지 않음 |

현재 `npm test` 스크립트는 `TMPDIR=/tmp` 문법을 사용하므로 WSL 또는 POSIX 셸에서 실행하세요. Windows PowerShell에서는 `npx vitest run`으로 테스트를 직접 실행할 수 있습니다. 테스트 소스는 제품 코드와 분리된 최상위 `test/`에 있으며, `src/` 구조를 따라 application·localization·site contract·UI 경계를 검증합니다.

빌드 후 `test/build/content-script-smoke.mjs`는 실제 manifest가 가리키는 번들을 Happy DOM에서 실행하여 Area·Route 사이드바 초기화, 열기·닫기, OFF/ON, 재주입을 확인합니다. 네트워크·번역 API·사용자 프로필은 사용하지 않으며 실제 브라우저 검증을 대체하지 않습니다. `npx wxt build`나 `npx wxt zip` 직접 실행은 이 필수 검사를 우회하므로 검증된 배포 명령으로 취급하지 않습니다. 사이드바 오류 조사 기록 (로컬 참고: `docs/sidebar-runtime-error-2026-09-28.md`)

Chrome·Whale의 `zip` 명령은 `scripts/extension-package.mjs`의 공통 검사를 사용합니다. 제품명·패키지 버전·MV3, 툴바 `action`, sidebar·legacy action 부재, `storage`와 Mountain Project 두 HTTPS 호스트만 사용하는 권한·content script 범위를 확인합니다. manifest가 참조하는 팝업·아이콘·스크립트·CSS와 제3자 고지 파일은 비어 있지 않은 로컬 파일이어야 합니다. 경로 이탈·원격 참조·빌드 디렉터리 밖 symlink를 거부하고, 생성된 ZIP도 허용된 파일 구성과 실제 참조 내용을 다시 검사합니다. 검사 결과는 실제 번역·로그인·사이트 동작이나 스토어 승인을 보장하지 않습니다.

테스트는 페이지 판별, 번역 규칙, DOM 변경과 원복, 동적 콘텐츠, 지도·통계·목록 UI 등을 다룹니다. 번역 품질 corpus는 문맥별 용어, 다의어 충돌, 고유명사·등급 보존, 토큰 무결성 실패, 캐시 격리, 섹션 재번역과 장문 댓글의 원자적 표시를 검증합니다. Mountain Project 계약 테스트는 현재 구조뿐 아니라 Bootstrap 클래스 변경, 중간 wrapper 추가, 필수 landmark 누락과 fallback도 검증합니다. 상단 컨트롤은 운영 헤더의 gutter·로고·탭·사용자 버튼·햄버거 spacing을 재현한 렌더 fixture에서 computed style을 추가로 검증합니다. 자동 테스트와 빌드 성공만으로 실제 사이트의 로그인·기여·지도·번역 엔진 동작까지 검증되는 것은 아닙니다.

유지보수 변경의 기본 검증 순서는 다음과 같습니다.

```bash
npm test
npm run typecheck
npm run typecheck:test
npm run build
npm run build:firefox
git diff --check
```

2026-09-28 작업트리 동기화 당시 프로덕션·테스트 타입 검사, `52/52` 테스트 파일의 `490/490` 테스트, Chrome MV3·Firefox MV2 빌드와 `git diff --check`가 통과했습니다. 당시 content script SHA-256은 `b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`이며 이후 사이드바 오류 조사에서 재빌드한 산출물·검증 범위는 후속 기록 (로컬 참고: `docs/sidebar-runtime-error-2026-09-28.md`)에 구분했습니다. 검증 기록은 clean commit이나 공개 배포 승인을 뜻하지 않습니다.

2026-09-29 출시 준비 점검에서는 타입 검사, 전체 61개 파일·634개 테스트(`--maxWorkers=4`), Chrome ZIP 생성과 패키지 검사를 통과했습니다. 기본 동시 실행에서 발생한 시간 초과와 재검증 조건은 [소스 점검 기록](release-source-audit-2026-09-29.md)에 남겨 두었습니다.

웨일 변경 전 2026-10-01 검증에서는 소스·테스트 타입 검사, Chrome 빌드·번들 smoke와 배포 도구 6/6 검사를 통과했습니다. 전체 회귀는 664개 중 661개 통과, 실패한 비동기 검사 3개 파일의 순차 재실행은 38/38 통과했습니다. 단일 전체 실행의 전수 통과로 표시하지 않습니다. 상세 조건은 [검증 기록](documentation-sync.md)을 따릅니다. 최신 첫 실행 온보딩의 실제 Chrome 표시와 언어팩 다운로드 완료는 아직 검증 증거가 없습니다. Whale 후속 검증은 [별도 기록](whale-validation-2026-10-01.md)으로 구분합니다.

변경 후에는 실제 브라우저에서 다음 항목도 확인합니다.

- Main → South Korea Area → Route 탐색과 검색·링크 동작
- 본문 번역, 원문 보기·숨기기, 재번역의 갱신·동일·실패 상태, 번역 엔진 미지원 시 원문 유지
- 긴 댓글의 문단·줄바꿈·링크 보존과 일부 문단 실패 시 전체 원문 유지
- 사진·댓글 등 동적으로 추가되는 콘텐츠
- 지도·루트 통계와 사용자 페이지의 표시
- 상단 컨트롤 바와 팝업 양쪽의 ON/OFF 동기화, 원문·레이아웃 복원, OFF 상태에서 컨트롤 바 유지와 재활성화
- `enabled` 키 없는 프로필의 OFF·첫 실행 강조, 저장된 ON/OFF 유지, 상단 ON의 준비 시작과 저장 성공/실패, 새로고침 후 안내 여부. 기존 사용자 설정을 지우지 않도록 별도 개발 프로필 사용
- 대한민국 링크의 같은 탭 이동, 아바타·Sign In 클릭, Tab·Space 키보드 조작과 좁은 화면 배치
- 로그인 상태에서 `페이지에 추가`와 `이 페이지 개선`의 실제 메뉴 항목, AJAX 개선 모달 번역, 입력 중 내용 보존과 취소·이동 동작. 저장·제출 검증은 테스트 계정과 명시적인 제출 범위를 정한 뒤 별도로 수행

## 후속 버전 배포 도구

프로젝트 루트의 WSL 터미널에서 실행합니다. 배포 중에는 같은 작업 폴더에서 소스 수정이나 다른 빌드를 실행하지 않습니다. 버전 번호는 예시이며, 실제 스토어에 올라간 버전보다 높게 정합니다.

1. 개발 내용을 정리한 뒤 `npm run release -- version 0.1.1`을 실행합니다. `package.json`과 `package-lock.json`의 버전을 함께 갱신하며 현재 로컬 버전과 동일·하위 버전은 거부합니다. 스토어의 최신 버전은 조회하지 않으므로 제출자가 별도로 비교합니다.
2. `CHANGELOG.md`에 `## 0.1.1 — 날짜` 형식의 변경 내역을 작성합니다. README·기능 문서·Notion을 실제 구현과 대조하고 변경된 권한·데이터 처리가 있으면 개인정보·스토어 설명도 갱신합니다. 소스·버전·문서를 검토해 커밋합니다.
3. `npm run release -- prepare`를 실행합니다. 미커밋 변경이 있으면 중단합니다. 의존성 설치(`npm ci`) → 제품·테스트 타입 검사 → 배포 도구 테스트 → 전체 Vitest(최대 4 worker) → 기존 검증된 ZIP 생성 명령 순서로 실행합니다. 하나라도 실패하면 배포 기록을 생성하지 않습니다.
4. 출력된 `.output/releases/0.1.1/`의 ZIP을 별도 폴더에 풀어 실제 Chrome에서 확인합니다. `CHECKLIST.md`에 결과를 기록합니다. 제출할 ZIP 자체를 수정하지 않습니다.
5. 업로드 직전에 `npm run release -- verify 0.1.1`을 실행합니다. 준비 당시 Git 커밋·현재 작업트리·ZIP 해시·manifest·파일별 해시를 다시 확인합니다. 이 명령은 테스트·빌드를 재실행하거나 수동 체크리스트 완료를 판정하지 않습니다. 소스 커밋이 GitHub에도 반영되었는지는 별도로 확인합니다.
6. 기존 Chrome 웹 스토어 항목 `ijgghnbmgbapfckfnkcapbkbbobjochh`에 확인된 ZIP을 업로드하고 심사 제출·게시 설정을 확인합니다. 승인 후 공개된 버전을 확인하고 `docs/release-status.md`와 Notion의 출시 상태를 함께 갱신합니다.

산출물은 ZIP, `release.json`, `CHECKLIST.md` 세 개입니다. 신규 `release.json`은 schema 2이며 `browser`, 버전·Git 커밋·시간·ZIP SHA-256·manifest·파일별 해시와 통과한 명령 목록 `checks`를 기록합니다. Chrome 기록만 기존 스토어 ID를 포함합니다. 이전 schema 1 Chrome 기록도 기존 검증 조건을 만족하면 계속 확인할 수 있지만 Whale 기록으로 재사용할 수는 없습니다. `.output/`는 Git에서 제외되므로 보관할 배포 증거는 별도로 백업합니다. 기록의 `prepared`는 로컬 준비 상태이며 실브라우저 통과·심사 제출·승인을 뜻하지 않습니다.

도구는 위 공통 패키지 검사와 실제 ZIP 검사를 사용합니다. 의도적으로 권한이나 패키지 구조를 바꾸면 `scripts/extension-package.mjs`, `scripts/release.mjs`의 기준, 테스트, 관련 문서를 함께 검토합니다. 원격 코드·개인정보 준수 전체를 자동 판정하는 검사는 아닙니다.

같은 버전의 출력 폴더는 덮어쓰지 않습니다. 준비 이후 문서만 커밋해도 `verify`는 거부합니다. 미제출 후보를 다시 준비해야 한다면 기존 증거를 다른 위치에 보관해 해당 버전 출력 폴더를 비운 뒤 재검증합니다. 이미 스토어에 업로드한 버전은 새 버전 번호로 진행합니다. 실패한 실행에서 남은 일반 `.output/` ZIP을 대신 업로드하지 않습니다.

Git 커밋·push, Notion 수정, 실제 Chrome 확인, 스토어 업로드·심사 제출은 도구가 자동 수행하지 않습니다. 이 단계들은 생성된 체크리스트에 따라 진행합니다. 배포 도구 자체의 회귀 검사는 `npm run test:release`로 독립 실행합니다.

### Whale 기록 분리

위 기본 명령과 Chrome 경로는 그대로 유지합니다. `prepare`·`verify`에만 마지막 인자로 `--browser whale`을 붙이면 Whale을 선택하며, 생략하거나 `--browser chrome`을 지정하면 Chrome입니다. Firefox는 이 배포 도구의 대상이 아닙니다. `version`은 두 브라우저에 공통인 패키지 버전을 변경하며 `--browser`를 받지 않습니다.

| 산출물 | Chrome | Whale |
| --- | --- | --- |
| 개발 빌드 폴더 | `.output/chrome-mv3` | `.output/whale-mv3` |
| 일반 ZIP | `.output/mountain-project-korea-extension-<버전>-chrome.zip` | `.output/mountain-project-korea-extension-<버전>-whale.zip` |
| `prepare` 기록 폴더 | `.output/releases/<버전>/` | `.output/releases/whale/<버전>/` |

Whale의 `prepare`는 같은 깨끗한 커밋·버전 일치·CHANGELOG 조건에서 의존성 설치, 타입 검사, 배포·패키지 검사 테스트, 전체 Vitest와 `zip:whale`를 실행합니다. `verify <버전> --browser whale`은 브라우저·ZIP 이름·기록된 검사 목록·현재 소스·해시를 대조합니다. Chrome 스토어 ID가 들어간 Whale 기록은 거부합니다. 수동 체크리스트 완료 여부나 실제 Whale의 번역 지원은 자동 판정하지 않습니다.

이번 호환성 프로토타입은 버전을 올리거나 웨일 스토어에 제출하지 않습니다. 개발 설치는 `build:whale`, 일반 패키지 확인은 `zip:whale`만으로 가능하며 두 명령은 `release.json`을 만들지 않습니다. `prepare`는 커밋이 정리된 별도 배포 준비 단계입니다. 실제 실행 결과·브라우저 상태는 [웨일 검증 기록](whale-validation-2026-10-01.md)으로 관리하고 Chrome 출시 증거로 대체하지 않습니다.

## 권한 및 데이터 처리

- `storage`: 확장 활성화 여부를 브라우저의 `storage.local`에 저장합니다.
- `https://mountainproject.com/*`, `https://www.mountainproject.com/*`: 대상 페이지의 내용을 읽고 한국어화 및 탐색 UI를 적용합니다.
- 현재 별도 백엔드 서버나 외부 번역 API 키 설정은 없습니다. 본문 번역에는 브라우저의 내장 API를 사용합니다.
- 지도와 통계는 Mountain Project 페이지를 iframe으로 불러오므로 사이트로의 네트워크 요청이 발생합니다. 가이드 등록 수는 사용자가 불러오기 버튼을 누를 때만 MP 공개 페이지를 조회합니다.
- 대규모 크롤링이나 별도 원본 콘텐츠 데이터베이스 구축은 프로젝트의 목표가 아닙니다. 정보 축적은 사용자가 Mountain Project의 기존 기능을 통해 직접 기여하는 것을 뜻합니다.

## 구조

```text
src/
├── application/    # 공통 runtime, 설정 수명주기, DOM ports와 페이지 조립
├── core/           # 브라우저·사이트 독립 설정, 번역 인터페이스와 기록
├── entrypoints/    # 콘텐츠 스크립트와 확장 팝업
├── localization/   # 고정 UI·고유명사 현지화, 본문 번역 제어
├── platforms/      # Chrome 번역 API, WebExtension 설정 저장
├── rendering/      # 원문 보존과 번역문 표시·복원
├── sites/
│   └── mountain-project/
│       ├── contract/ # 호스트·경로·지역 ID·selector·원문 문구·진단 계약
│       └── dom/      # 계약을 이용하는 의미 기반 DOM locator·page adapter
└── ui/             # 상단 컨트롤 바·지역·루트·지도·통계·사이드바 UI
test/               # src와 동급이며 제품 빌드에서 제외되는 테스트 루트
├── application/    # runtime·설정·페이지 조립 회귀
├── boundary/       # 사이트 계약 밖으로 고위험 리터럴이 새는지 검사
├── fixtures/
│   └── mountain-project/
├── localization/
├── platforms/
├── rendering/
├── sites/
│   └── mountain-project/
└── ui/
docs/               # 구현 명세, 배포·검증 및 조사 기록
previews/           # 로컬 디자인 기록과 독립 미리보기
privacy-site/       # 공개 개인정보처리방침 정적 HTML
public/             # 빌드에 포함되는 제3자 고지
wxt.config.ts       # 매니페스트와 브라우저별 WXT 빌드 설정
```

기술 스택은 WXT, TypeScript, Vitest, happy-dom입니다. 현재 제품 코드는 React를 사용하지 않고 직접 DOM Renderer로 구성하며, 복잡한 독립 Renderer가 필요할 때만 도입을 검토합니다. `.output/`, `.wxt/`, `node_modules/`는 생성 파일이며 Git 관리에서 제외됩니다.

### Mountain Project 변경 대응

원본 사이트에서 URL, 지역 ID, 영문 문구나 DOM 구조가 바뀌면 먼저 `src/sites/mountain-project/contract/`을 수정합니다.

- `origins.ts`: 지원 호스트와 manifest match pattern
- `routes.ts`: 페이지 판별, URL parser와 builder
- `regions/south-korea.ts`: 대한민국 루트 지역과 하위 지역 ID·이름
- `selectors/`: 페이지별 DOM landmark 후보와 iframe chrome
- `text/`: 원본 영문 UI 문구와 한국어 대응
- `selectors/contribution.ts`, `text/contribution.ts`: 추가·편집·제안 화면과 AJAX 개선 모달의 폼 범위 및 고정 UI 번역 계약
- `schema.ts`, `diagnostics.ts`: locator 결과와 구조 변경 진단 형식

`src/sites/mountain-project/dom/`의 locator는 정확한 현재 구조를 먼저 사용하고, 클래스 변경이나 wrapper 추가 시 의미 기반 후보로 fallback합니다. 제품 UI는 가능하면 이 locator 결과 또는 계약 selector만 사용합니다. `test/boundary/site-contract-boundary.test.ts`는 지원 호스트, 대한민국 루트 ID와 지도·통계 고위험 selector가 계약 밖에 다시 하드코딩되는 것을 막습니다.

전역 Area 지도 기능의 공식 진입점은 `src/ui/area-map-embed.ts`입니다. 구현 본체는 기존 import 호환성을 위해 현재 `src/ui/south-korea-map-embed.ts` 파일명을 유지하지만, 유효한 공통 Area DOM에서는 대한민국에 한정되지 않습니다.

필수 landmark를 찾지 못하면 콘텐츠 스크립트는 사용자 화면에 디버그 UI를 추가하지 않고, 개발자 콘솔에 `[MPKR contract]` 경고와 구조화된 진단 객체를 남깁니다. DOM observer가 재시도하더라도 동일 컴포넌트·페이지에서는 한 번만 기록됩니다. 지도나 통계 같은 선택 기능의 계약 실패는 번역 Core의 `ready` 상태를 실패로 바꾸지 않습니다.

### 플랫폼 경계

`src/core/`는 브라우저와 Mountain Project DOM에 의존하지 않는 공통 로직입니다. Mountain Project 전용 규칙은 `src/sites/`, 브라우저 API 구현은 `src/platforms/`, WXT 조립은 `src/entrypoints/`에 둡니다. 이후 Firefox Android, Safari Web Extension과 WebView를 추가할 때는 공통 Core와 사이트 계약을 유지하고 번역·저장소·내비게이션 구현만 플랫폼 adapter로 교체하는 방향입니다.

### Application/runtime 재사용

`application/runtime.ts`는 `SettingsRepository`, `PageLifecycle`, 선택적인 `ApplicationShell`을 받아 초기 설정, watch, enable/disable, 최종 destroy를 관리합니다. 콘텐츠 진입점은 `NavigationControls`를 shell로 주입합니다. shell은 설정을 읽기 전에 한 번 마운트되고 ON/OFF마다 상태를 표시하며, OFF에는 제거되지 않습니다. 최종 destroy/invalidation에서 설정 구독·shell·페이지를 함께 정리합니다. 초기 설정 조회나 저장 중 도착한 최신 변경 및 종료를 오래된 비동기 결과가 덮어쓰지 않습니다. `mountain-project-application.ts`는 기존 DOM 기능을 조립합니다. `PageTranslationController`에는 `TranslationPageAdapter`와 `TranslationRenderer`를 명시적으로 주입하고, 공통 `DomTranslationTarget`은 `application/ports.ts`에 둡니다. DOM이 없는 설정 port와 `TranslationProvider`는 `core/`에 있습니다.

| 실행 환경 | 제공할 adapter / composition root |
| --- | --- |
| Chrome / Whale / Firefox | 현재 WXT `entrypoints/content.ts`가 WebExtension 저장소, Chrome Translator provider와 내비게이션 shell을 주입하고, invalidation을 runtime.destroy에 연결합니다. Whale도 공통 코드를 사용하며 전용 소스를 복제하지 않습니다. Translator API 미지원 브라우저에서는 provider가 unavailable을 반환하므로 고정 UI만 번역됩니다. |
| Safari Web Extension | Safari 확장의 content root에서 공통 application/runtime을 생성하고 WebExtension 저장소 호환성을 확인합니다. 사용 가능한 번역 provider 또는 unavailable provider를 주입하고 확장 종료를 destroy에 연결합니다. 전용 빌드·실기기 검증은 아직 필요합니다. |
| Android Firefox | 같은 WXT root와 WebExtension 저장소를 재사용하고 번역 provider를 기능 감지해 선택합니다. 모바일 DOM·iframe 동작과 확장 종료를 실기기에서 검증해야 합니다. |
| WebView | 문서별 주입 root에서 호스트 저장소/변경 알림을 SettingsRepository로, 번역 bridge를 TranslationProvider로 구현합니다. 문서 교체 전 destroy하고 새 문서에서 새 runtime을 생성합니다. |

공통 application은 WXT나 `platforms/*`를 import하지 않습니다. DOM 조립은 각 문서의 `window`/`document`와 표준 DOM API를 사용하는 구조이므로 DOM 없는 네이티브 프로세스에서는 직접 실행할 수 없습니다. root는 프레임마다 한 번 생성하고, 현재 WXT의 `allFrames: true`를 유지합니다. 부모의 iframe 보조 처리와 프레임 내부 처리가 공유하는 기존 DOM 소유권·중복 방지 규칙은 UI adapter에 남깁니다. SPA 내비게이션을 새로 도입하지 않으며, WebView 호스트도 문서 수명주기를 연결해야 합니다.

`test/application/`은 설정 구독 경쟁, 종료, 재활성화와 실제 DOM 복원을 검증합니다. `test/boundary/application-boundary.test.ts`는 공통 코드가 플랫폼/entrypoint 모듈 및 WXT를 import하거나 확장 API를 직접 사용하는 것을 막습니다.

번역 런타임의 대상 모드, 재번역·실패 복구, 장문 댓글 처리와 부하 경계는 [번역 런타임 명세](translation-runtime.md)에 정리되어 있습니다.

## 알려진 제약 및 다음 과제

- Mountain Project의 DOM이나 문구가 바뀌면 번역·탐색 기능 조정이 필요할 수 있습니다.
- 유효한 공통 템플릿을 사용하는 Area·Route·Route Finder·Photo와 일부 탐색·커뮤니티 페이지에는 전역 기능을 적용하지만, Mountain Project의 모든 페이지 유형과 모든 변형 DOM을 지원하는 것은 아닙니다.
- 대한민국 게이트웨이, 한국 지명 매핑, 지역 목록 정렬과 Classic Routes 그룹화는 의도적으로 한국 범위에만 적용됩니다.
- 브라우저별 본문 번역 지원과 실제 페이지에서의 호환성 검증이 필요합니다.
- 로그인 상태의 기여·Tick·To-Do·댓글 제출, 모바일 iframe, Safari Web Extension과 WebView shell은 실제 환경 검증 또는 구현이 남아 있습니다.
- 기여·개선 경로의 고정 UI와 동적 모달은 지원하지만, 로그인 계정에서 메뉴 전체의 운영 DOM과 실제 저장·제출 결과를 전수 검증한 것은 아닙니다.
- 기계 번역의 정확성은 보장되지 않습니다. 접근·하강·장비 등 등반 판단에 필요한 정보는 원문과 함께 확인하세요.
- 브라우저 번역기가 보호 토큰을 변경하면 잘못 복원하지 않고 해당 번역을 표시하지 않습니다. 실제 Chrome 언어팩별 토큰 보존률은 수동 검증이 필요합니다.
- 후속 버전을 제출할 때도 스토어 설명·이미지·개인정보처리방침과 실제 권한·동작을 함께 대조합니다.

문제 제보와 기능 제안은 [GitHub Issues](https://github.com/jeongjong10/mountain-project-korea-extension/issues)에 남겨주세요. 페이지 URL, 브라우저 버전, 재현 절차와 기대한 동작을 포함하면 확인에 도움이 됩니다.


### 지역 디렉터리 — 전체 목록 유지

원본 링크 색·본문 크기와 점선 목록 스타일을 따릅니다. 아시아·유럽·아메리카 탭으로 목록을 전환합니다. 대한민국은 아시아 첫 묶음입니다. 국가별 목록은 원본 마크업을 재사용한 4/2/1단으로 표시하고, 아메리카는 원본 전체를 그대로 표시합니다.

- 대한민국 6개 권역과 아시아 8개국 34곳·유럽 7개국 31곳의 원정지 바로가기를 제공합니다. 선정은 방문 통계에 따른 인기 순위가 아닙니다. [목록과 선정 근거](region-directory.md)를 참고하세요.
- 아시아·유럽 등록 수는 **등록 수 불러오기** 버튼을 눌렀을 때만 조회합니다. 초기 로딩·탭 전환에는 요청하지 않습니다. 실패한 항목은 빈칸으로 두고 버튼으로 재시도할 수 있습니다.
- 첫 선택은 아시아입니다. 원본 노드의 위치는 바꾸지 않으며 OFF/destroy 시 원래 숨김 상태를 복원하고 추가 UI·스타일을 제거합니다.
- 원본 목록은 파싱해 재구성하지 않고 그대로 보존합니다. 현재 문서를 마운트하며 이후 원본 디렉터리 자체를 동적으로 교체하는 사이트 변형은 별도 대응이 필요합니다.
- 미리보기 (로컬 참고 파일: `previews/region-directory-designs.html`)는 공개 Route Guide의 디렉터리 HTML과 실제 구현 컴포넌트를 사용합니다. 미리보기 OFF는 데모 안에서만 작동합니다.

지역 디렉터리의 [구현 명세](region-directory.md)와 페이지별 배치 검토 (로컬 참고: `docs/region-directory-layout-audit.md`)를 참고하세요.
