# Mountain Project Korea Extension

한국 사용자의 Mountain Project 접근성과 사용성을 높여, 더 많은 한국 클라이머가 커뮤니티에 정착하고 활발히 참여하도록 돕는 **비공식 브라우저 확장 프로젝트**입니다.

한국어 현지화와 탐색 경험 개선으로 한국 클라이머의 해외 등반 준비를 돕고, 한국 사용자들이 공유하는 암장·루트 정보와 등반 경험이 Mountain Project에 축적되도록 기여합니다. 이렇게 쌓인 정보가 해외 클라이머의 한국 등반에도 도움이 되어, 전 세계 클라이밍 커뮤니티의 지식과 교류를 넓히는 것을 목표로 합니다.

> An unofficial browser extension improving Mountain Project’s accessibility and usability for Korean climbers, encouraging lasting community participation and shared climbing knowledge to help Korean climbers explore abroad and international climbers explore Korea.

## 현재 상태

- 버전: `0.1.0` — 개발 중인 프로토타입입니다.
- Chrome용 Manifest V3와 Firefox용 Manifest V2 빌드를 구성하고 있습니다.
- 본문 기계 번역은 Chrome 내장 `Translator` API를 사용하는 구현입니다. 브라우저별 기능이 동일하지 않습니다.
- 스토어 출시는 아직 완료되지 않았습니다. 프로젝트 문서상 공개 배포는 onX/Mountain Project 서면 확인과 공개 빌드 검토 전까지 보류 상태입니다.
- Mountain Project 또는 onX의 공식 제품이 아니며, 공식 제휴나 승인을 의미하지 않습니다.

## 구현된 기능

아래는 현재 코드에 구현된 범위입니다. 페이지 구조와 브라우저 환경에 따라 적용 범위가 달라지며, 사이트 전체의 번역이나 모든 기능의 호환성을 보장하지 않습니다.

| 영역 | 구현 내용 |
| --- | --- |
| 공통 UI | 내비게이션, 버튼, 폼 안내, 클라이밍 용어 등 고정 문구 한국어화 |
| 메인 페이지 | 대한민국 클라이밍 지역으로 이동하는 진입 영역 |
| 한국 지역 탐색 | 지역명 현지화, 지역 목록 정렬, 설명 접기·펼치기, Classic Routes 그룹화와 사진 표시 개선 |
| 본문·댓글 | 한국 지역으로 판별된 페이지의 설명·접근·장비 정보, 사진 설명·댓글 등 번역 대상 처리와 동적 콘텐츠 대응 |
| 원문 확인 | 번역된 본문 섹션에서 원문 보기·숨기기 |
| 지도 | South Korea 지도 임베드, 지도 섹션 접기·펼치기, 지도 내 루트 링크 새 탭 열기 |
| 루트·통계 | 루트 통계 임베드와 표시 개선, 통계 페이지 현지화 및 번역 대상 처리 |
| 검색·사용자 페이지 | Route Finder, 사용자 프로필·기여·커뮤니티·연락 페이지의 고정 UI 현지화 |
| 탐색 편의 | 지원되는 왼쪽 사이드바 접기·펼치기, 루트 목록의 링크 영역과 키보드 포커스 표시 개선 |
| 설정·복원 | 팝업에서 확장 ON/OFF, 활성화 설정 저장, OFF 시 확장이 적용한 번역과 화면 변경 복원 |

### 번역 방식과 범위

- **고정 UI·용어:** 확장에 포함된 번역 사전과 규칙으로 처리합니다.
- **고유명사:** 등록된 지역명 매핑을 사용하며, 루트명·사용자명·등급·수치 등 식별 정보의 보존을 지향합니다.
- **사용자 작성 콘텐츠:** 지원 대상에서 Chrome `Translator` API가 사용 가능하면 비동기로 자동 번역합니다. 모든 해외 지역의 본문을 번역하는 기능은 아직 아닙니다.
- **최초 언어팩 준비:** 브라우저에서 모델 다운로드나 사용자 동작이 필요한 경우 대기하고, 이후 페이지 상호작용에서 재시도합니다.
- **번역 불가·실패:** 원문을 유지합니다. 고정 UI 번역과 본문 기계 번역은 별도로 동작합니다.

## 브라우저별 범위

| 브라우저 | 현재 범위 |
| --- | --- |
| Chrome | 주 개발 대상. MV3 빌드와 내장 번역 API 연동 코드가 있습니다. 실제 본문 번역은 API 제공 여부와 언어팩 상태에 따라 달라집니다. |
| Firefox | MV2 빌드와 공통 WebExtension 설정을 제공합니다. 전용 본문 번역 엔진은 아직 구현되지 않았으며, 고정 UI와 탐색 기능은 별도 실사용 검증이 필요합니다. |
| Firefox Android | 매니페스트 설정이 포함되어 있으나, 모바일 동작 검증 완료를 의미하지 않습니다. |
| Safari | 전용 플랫폼 구현과 배포는 아직 제공하지 않습니다. |

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
5. [Mountain Project](https://www.mountainproject.com/) 또는 [South Korea](https://www.mountainproject.com/area/106225629/south-korea)를 열고 확장 팝업에서 번역을 켭니다.

이미 열려 있던 페이지는 새로고침하세요. 코드를 변경하고 다시 빌드한 경우 확장 관리 화면에서 확장을 새로고침한 뒤 해당 페이지도 새로고침합니다.

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
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm test` | Vitest 테스트 실행 |
| `npm run build` | Chrome 프로덕션 빌드 |
| `npm run build:firefox` | Firefox 프로덕션 빌드 |
| `npm run zip` | Chrome 배포용 ZIP 생성 |
| `npx wxt zip -b firefox` | Firefox 배포용 ZIP 생성 |

현재 `npm test` 스크립트는 `TMPDIR=/tmp` 문법을 사용하므로 WSL 또는 POSIX 셸에서 실행하세요. Windows PowerShell에서는 `npx vitest run`으로 테스트를 직접 실행할 수 있습니다.

테스트는 페이지 판별, 번역 규칙, DOM 변경과 원복, 동적 콘텐츠, 지도·통계·목록 UI 등을 다룹니다. 자동 테스트와 빌드 성공만으로 실제 사이트의 로그인·기여·지도·번역 엔진 동작까지 검증되는 것은 아닙니다.

변경 후에는 실제 브라우저에서 다음 항목도 확인합니다.

- Main → South Korea Area → Route 탐색과 검색·링크 동작
- 본문 번역, 원문 보기, 번역 엔진 미지원 시 원문 유지
- 사진·댓글 등 동적으로 추가되는 콘텐츠
- 지도·루트 통계와 사용자 페이지의 표시
- 확장 ON/OFF 및 원문·레이아웃 복원

## 권한 및 데이터 처리

- `storage`: 확장 활성화 여부를 브라우저의 `storage.local`에 저장합니다.
- `https://mountainproject.com/*`, `https://www.mountainproject.com/*`: 대상 페이지의 내용을 읽고 한국어화 및 탐색 UI를 적용합니다.
- 현재 별도 백엔드 서버나 외부 번역 API 키 설정은 없습니다. 본문 번역에는 브라우저의 내장 API를 사용합니다.
- 지도와 통계는 Mountain Project 페이지를 iframe으로 불러오므로 사이트로의 네트워크 요청이 발생합니다.
- 대규모 크롤링이나 별도 원본 콘텐츠 데이터베이스 구축은 프로젝트의 목표가 아닙니다. 정보 축적은 사용자가 Mountain Project의 기존 기능을 통해 직접 기여하는 것을 뜻합니다.

## 구조

```text
src/
├── adapters/       # Mountain Project DOM에서 번역 대상 수집
├── core/           # 페이지 판별, 고정 번역 사전, 설정·번역 인터페이스
├── entrypoints/    # 콘텐츠 스크립트와 확장 팝업
├── localization/   # 고정 UI·고유명사 현지화, 본문 번역 제어
├── platforms/      # Chrome 번역 API, WebExtension 설정 저장
├── rendering/      # 원문 보존과 번역문 표시·복원
├── test-fixtures/  # 페이지 구조를 재현한 테스트 데이터
└── ui/             # 지역·루트·지도·통계·사이드바 UI
```

기술 스택은 WXT, TypeScript, Vitest, happy-dom입니다. `.output/`, `.wxt/`, `node_modules/`는 생성 파일이며 Git 관리에서 제외됩니다.

## 알려진 제약 및 다음 과제

- Mountain Project의 DOM이나 문구가 바뀌면 번역·탐색 기능 조정이 필요할 수 있습니다.
- 현재 중심 범위는 한국 지역 탐색과 관련 페이지입니다. 해외 등반 지원은 프로젝트의 목표이며, 해외 지역 전체 현지화는 아직 완료되지 않았습니다.
- 브라우저별 본문 번역 지원과 실제 페이지에서의 호환성 검증이 필요합니다.
- 기계 번역의 정확성은 보장되지 않습니다. 접근·하강·장비 등 등반 판단에 필요한 정보는 원문과 함께 확인하세요.
- 스토어 제출 전에는 아이콘·소개 이미지·개인정보처리방침 등 배포 자료와 실제 권한·동작을 함께 검토해야 합니다.

문제 제보와 기능 제안은 [GitHub Issues](https://github.com/jeongjong10/mountain-project-korea-extension/issues)에 남겨주세요. 페이지 URL, 브라우저 버전, 재현 절차와 기대한 동작을 포함하면 확인에 도움이 됩니다.
