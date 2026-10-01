# Mountain Project Korea (비공식)

Mountain Project를 한국어로 읽고 더 편리하게 탐색하도록 돕는 브라우저 확장 프로그램입니다. 한국 클라이머의 해외 등반 준비와 Mountain Project 커뮤니티 참여를 지원합니다.

> An unofficial browser extension that helps Korean climbers read and explore Mountain Project.

[Chrome 웹 스토어에서 설치](https://chromewebstore.google.com/detail/ijgghnbmgbapfckfnkcapbkbbobjochh) · [개발 문서](docs/README.md) · [변경 내역](CHANGELOG.md)

Mountain Project 또는 onX의 공식 제품이 아니며, 공식 제휴나 승인을 의미하지 않습니다.

![Mountain Project Korea 적용 화면](design/store-assets/screenshot-home-1280x800.png)

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 한국어 UI | 지원 화면의 메뉴, 검색, 버튼과 기여 폼 안내를 한국어로 표시합니다. |
| 본문·댓글 번역 | 지원되는 지역·루트·사진·커뮤니티 페이지의 내용을 브라우저 내장 번역 기능으로 기기 안에서 번역합니다. |
| 원문 확인·재번역 | 지원 본문의 원문을 확인하거나 다시 번역할 수 있습니다. 번역할 수 없으면 원문을 유지합니다. |
| 지역 탐색 | 대한민국 바로가기와 아시아·유럽·아메리카 지역 목록을 제공합니다. 지역 등록 수는 버튼을 눌러 조회합니다. |
| 지도·루트 통계 | 지역 지도와 루트 통계를 페이지에서 확인하고, 목록과 사이드바를 접거나 펼칠 수 있습니다. |
| 기능 ON/OFF | 페이지 상단과 확장 팝업에서 번역·탐색 기능을 함께 켜고 끕니다. |

[지역 지도 화면](design/store-assets/screenshot-korea-map-1280x800.png) · [루트 상세 화면](design/store-assets/screenshot-route-detail-1280x800.png)

## 설치와 사용

1. 데스크톱 Chrome에서 [스토어 페이지](https://chromewebstore.google.com/detail/ijgghnbmgbapfckfnkcapbkbbobjochh)를 열고 **Chrome에 추가**를 선택합니다.
2. [Mountain Project](https://www.mountainproject.com/)를 열거나 기존 페이지를 새로고침합니다.
3. 페이지 상단 또는 확장 팝업의 **확장 기능** 스위치로 기능을 켜고 끕니다.
4. 번역된 본문에서 **원문 보기**와 **재번역**을 사용할 수 있습니다.

Chrome 스토어의 `0.1.0`은 기본 ON입니다. 미출시 소스 버전 `0.1.1`은 저장된 설정이 없으면 OFF로 시작하고 활성화를 안내합니다. 기존에 저장한 ON/OFF 설정은 유지합니다. 소스 설치는 [개발 안내](docs/development.md)를 따릅니다.

## 지원 범위

공개 설치 대상은 데스크톱 Chrome입니다. 본문 번역에는 브라우저의 Translator API와 영어·한국어 언어팩이 필요합니다. API를 사용할 수 없는 환경에서도 지원되는 고정 UI와 탐색 기능은 동작합니다. Edge·Firefox는 미출시 개발 빌드이며 Chrome과 같은 기능을 보장하지 않습니다. Whale은 지원 대상에서 제외되어 있으며 모바일·Safari의 정식 지원은 제공하지 않습니다.

| 페이지 | 기능 |
| --- | --- |
| 지역·루트·사진·Route Finder | 지원 본문·설명·댓글 번역과 페이지별 탐색 기능 |
| 루트 통계 | 고정 UI와 등반 기록 메모 번역, 목록 표시 개선 |
| 검색·포럼·파트너 찾기·짐·새 소식 | 지원 화면의 고정 UI와 작성 콘텐츠 번역 |
| 도움말·Help Hub·소개 | 지원 본문과 기능 제안 제목·설명 번역 |
| 사용자·기여 목록·연락 | 고정 UI 현지화 |
| 추가·편집·제안 폼 | 고정 안내·라벨 현지화. 작성값과 제출 데이터 보존 |

기능은 지원되는 페이지 구조에서 적용됩니다. 고정 UI의 짧은 문구에는 원문 보기·재번역 버튼이 없을 수 있습니다. 기계 번역에는 오류가 있을 수 있으므로 접근·하강·장비 등 등반 판단에 필요한 정보는 원문과 함께 확인하세요.

## 문제 해결

- **설치 후 변화가 없을 때:** MP 페이지를 새로고침하고 확장 팝업에서 기능이 켜져 있는지 확인합니다.
- **메뉴만 번역될 때:** 본문 번역 엔진이나 언어팩이 준비되지 않았을 수 있습니다. 페이지에 표시되는 준비·미지원 안내를 확인합니다. 소스 `0.1.1`에서는 상단 스위치를 켜거나 본문 페이지를 클릭해 준비를 시작할 수 있습니다.
- **원래 화면으로 돌아가려면:** 확장 기능을 끕니다. 다시 켤 수 있도록 상단 스위치와 대한민국 링크는 남습니다.
- **특정 페이지에서 문제가 생길 때:** [GitHub Issues](https://github.com/jeongjong10/mountain-project-korea-extension/issues)에 페이지 URL, 브라우저 버전, 재현 과정과 기대 동작을 적어 주세요. 첨부 화면의 개인정보는 가려 주세요.

## 개인정보와 권한

`storage` 권한으로 ON/OFF 설정을 현재 브라우저에 저장하며, Mountain Project 페이지에 접근해 번역과 탐색 기능을 제공합니다. 본문과 번역 결과는 페이지 메모리에 임시 보관하며 개발자 서버로 전송하지 않습니다. 지도·통계와 등록 수 조회에는 Mountain Project로의 추가 요청이 발생합니다.

[개인정보처리방침](https://mountain-project-korea-privacy.jeongjongyeol.chatgpt.site/) · [방침 원본](docs/privacy-policy.ko.md)
