# Microsoft Edge Add-ons 제출 키트

2026-10-01. 첫 Edge 제출 후보 `0.1.1`. 사용자 요청으로 이전 `0.1.0` 후보를 대체합니다. 이 문서는 입력용 문안이며 계정 등록·스토어 제출·승인을 완료했다는 기록이 아닙니다. Chrome의 공개 `0.1.0`과는 배포 채널 및 소스 시점이 다릅니다.

## 1. 먼저 개발자 등록

1. 개인 Microsoft 계정으로 [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)에 로그인합니다.
2. 등록 화면이 안 보이면 **Account settings → Programs → Microsoft Edge → Get started**로 이동합니다.
3. 실제 거주 국가를 선택하고, 개인 개발자로 게시한다면 **Individual**을 선택합니다. 게시자 표시 이름은 본인의 공개 이름을 사용합니다.
4. 본인의 연락처를 입력하고, 약관을 직접 읽고 동의한 뒤 **Finish**를 누릅니다. 인증 요청과 등록 확인 메일을 확인합니다.

Edge 개발자 등록은 무료입니다. 국가와 계정 종류는 등록 후 변경할 수 없으므로 실제 정보로 입력합니다. 로그인·인증·개인정보·약관 동의는 계정 소유자가 직접 처리합니다. [Microsoft 등록 안내](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account)

## 2. 업로드할 파일

프로젝트 폴더의 `.output/releases/edge/0.1.1/`에 다음 자료를 모읍니다.

| 파일 | 용도 |
| --- | --- |
| `mountain-project-korea-extension-0.1.1-edge.zip` | Packages에 업로드할 확장 패키지 |
| `release.json` | 검증한 소스 커밋·파일별 해시·ZIP SHA-256·검사 결과 |
| `CHECKLIST.md` | 최종 제출 전 확인표 |
| `submission/` | 이 안내, 복사용 텍스트, 아이콘·기존 공통 UI 이미지 |
| `unpacked/` | 위 최종 ZIP을 풀어 둔 수동 확인용 폴더 |

`release.json`이 없는 개발 ZIP을 최종 후보와 혼동하지 않습니다. 이 디렉터리 전체를 다시 압축하지 않고 위 **edge.zip 하나**를 업로드합니다. ZIP 루트에 `manifest.json`이 있습니다.

최종 ZIP의 `unpacked` 폴더를 `edge://extensions`의 개발자 모드 → 압축 풀린 파일 로드로 열 수 있습니다. 기존 확장이 함께 켜져 있으면 잠시 사용 중지하고 한 개만 실행합니다. 기존 확장을 삭제하거나 설정을 지울 필요는 없습니다. 상단 ON 뒤 한국어 본문·원문 보기·재번역·팝업 OFF/ON·설정 유지·지도·루트 통계를 확인합니다. 앞선 사용자 확인은 정상으로 기록되어 있으나 그 창이 이 최종 ZIP을 실행했는지는 미확정입니다. 새 폴더의 확장 ID·설정·모델 상태는 기존 설치와 다를 수 있습니다.

## 3. Partner Center 입력 순서

**Create new extension → Packages → Availability → Properties → Privacy → Store listings → Publish** 순서로 진행합니다. 필수 항목을 저장하고 마지막 심사자 메모에 아래 영문 안내를 붙입니다. 공개 배포 목적이면 Availability는 **Public**을 선택합니다. [Microsoft 제출 안내](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)

| 항목 | 입력할 내용 |
| --- | --- |
| 기본 언어 | 한국어 (Korean) |
| Category | 생산성 / Productivity가 있으면 선택 |
| 지원 이메일 | `whdduf972@gmail.com` |
| Website URL (선택) | `https://github.com/jeongjong10/mountain-project-korea-extension` |
| Privacy Policy URL | `https://mountain-project-korea-privacy.jeongjongyeol.chatgpt.site` |
| 로고 | `submission/icon-128.png` |
| 스크린샷 (선택) | `submission/screenshot-route-detail-1280x800.png`, `submission/screenshot-korea-map-1280x800.png` |

선택 이미지 두 장은 기존 Chrome 공통 UI 캡처입니다. Edge 전용 새 실검증 캡처라고 표시하지 않습니다. 동일한 기능 화면 참고용이며, 제출 시 현재 Edge 화면과 차이가 보이면 이미지를 생략하거나 교체합니다. 상세 설명과 아래 문안은 확장 소스의 실제 동작에 맞춰 작성했습니다.

## 4. 이름·짧은 설명

패키지 manifest에서 가져오는 값입니다.

```text
Mountain Project Korea (비공식)
```

```text
Mountain Project 지원 페이지의 한국어 번역과 탐색을 돕는 비공식 확장 프로그램.
```

## 5. 상세 설명

```text
Mountain Project Korea (비공식)는 Mountain Project의 지원 페이지를 한국어로 읽고 탐색하도록 돕는 확장 프로그램입니다. Mountain Project 및 onX의 공식 제품이 아니며 두 서비스와 제휴하지 않습니다.

주요 기능
• 내비게이션, 버튼, 검색·폼 안내와 클라이밍 용어 등 지원되는 고정 문구를 한국어로 표시합니다.
• 지원되는 지역·루트·검색·사진 페이지의 본문과 댓글을 영어에서 한국어로 번역합니다. 루트 통계의 등반 메모, 포럼 토픽과 도움말 등 지원 영역도 번역합니다.
• 지원 본문에서 원문을 확인하거나 해당 섹션을 다시 번역할 수 있습니다. 일부 짧은 제목에는 별도 버튼이 표시되지 않습니다.
• 지역 지도와 루트 통계를 페이지 안에서 확인하고, 대한민국 바로가기와 지역 탐색 기능을 사용할 수 있습니다.
• 상단 스위치와 확장 팝업에서 기능을 켜고 끕니다. 설정이 없는 첫 실행은 OFF이며 활성화 안내가 표시됩니다. 기존 ON/OFF 선택은 같은 브라우저 프로필에 유지됩니다.

번역 조건
데스크톱 Microsoft Edge를 대상으로 합니다. 본문 번역은 Edge 내장 Translator API로 기기 안에서 수행하며 브라우저·기기·영어/한국어 언어팩 지원이 필요합니다. 최초 사용 시 모델 다운로드와 페이지에서의 클릭이 필요할 수 있습니다. 상단 스위치를 켠 뒤 준비가 끝날 때까지 기다리세요. 저장된 ON이나 팝업 ON으로 시작했다면 본문 페이지를 한 번 클릭해 주세요. 번역을 사용할 수 없거나 실패하면 원문을 유지하며 외부 번역 서비스로 자동 전환하지 않습니다.

모든 페이지·문장·이미지를 번역하는 제품은 아닙니다. 사용자 프로필·기여·연락 페이지는 고정 UI를 중심으로 처리하며 입력값은 보존합니다. 원본 사이트 구조가 바뀌면 일부 기능을 건너뛸 수 있습니다. 기계 번역은 오류가 있을 수 있으므로 필요한 내용은 원문과 대조해 주세요.

권한과 개인정보
storage 권한은 ON/OFF 설정 저장에 사용하며 사이트 접근은 mountainproject.com과 www.mountainproject.com에 한정됩니다. 지원 페이지의 텍스트·주소·화면 구조를 로컬에서 사용합니다. 원문·번역은 페이지 메모리에 임시 보관하고 개발자 서버로 본문이나 사용 기록을 보내지 않습니다. 원격 분석이나 자체 광고 추적도 없습니다.

지도는 처음 펼칠 때, 루트 통계는 ON 상태의 지원 페이지에서 자동으로 원본 사이트 화면을 불러올 수 있습니다. 이에 따라 Mountain Project 및 해당 화면의 리소스 제공자에게 추가 요청과 IP·일반 요청 정보가 전달되며 브라우저 설정에 따른 사이트 쿠키가 사용될 수 있습니다. 지도를 접는 것만으로 통신이 종료되지는 않습니다. OFF는 추가한 지도·통계를 제거합니다. 등록 수 불러오기 버튼은 공개 지역 HTML을 쿠키 없이 조회합니다.

문의: whdduf972@gmail.com
문의로 직접 보낸 주소·내용·첨부는 답변과 문제 확인에 사용하며, 후속 확인 후 불필요한 기록·첨부를 지체 없이 삭제합니다. 자세한 내용은 연결된 개인정보처리방침을 확인해 주세요.
```

## 6. 목적·권한 사유

Single Purpose:

```text
Mountain Project의 지원 페이지를 한국어로 읽고 탐색하도록 돕습니다. 고정 UI 현지화, 지원 본문·댓글의 기기 내 영어-한국어 번역, 원문 확인, 지역 지도·루트 통계 표시와 대한민국 탐색은 이 목적을 위한 기능입니다.
```

storage:

```text
기능 ON/OFF 값(enabled)을 storage.local에 저장하고 같은 브라우저 프로필의 페이지와 팝업에 변경을 반영합니다. 본문·번역 결과나 방문 이력을 이 저장소에 저장하지 않으며 storage.sync를 사용하지 않습니다.
```

Host permissions (두 호스트 입력란에 공통 사용):

```text
https://mountainproject.com/* 및 https://www.mountainproject.com/* 의 지원 페이지와 일치하는 프레임에서 주소·DOM·텍스트를 읽어 한국어 현지화, 본문 번역·원문 복원, 지도·통계와 탐색 UI를 제공합니다. www 유무에 따른 두 주소를 지원합니다. 사용자가 기능을 켜면 여러 지역·페이지에서 지속 동작해야 하므로 한 경로나 일회성 탭 접근만으로 구현할 수 없습니다. 다른 사이트 전체 접근은 요청하지 않습니다.
```

## 7. 원격 코드·데이터 공개

**확장 실행 맥락의 원격 JS/Wasm 사용: No.** 실행 코드와 고정 번역 사전은 ZIP에 들어 있습니다. `eval`로 내려받은 코드를 실행하거나 원격 코드로 기능을 구성하지 않습니다. Edge가 관리하는 번역 모델 다운로드는 확장 JS 다운로드가 아닙니다. 지도·통계 iframe은 원본 사이트 스크립트를 실행할 수 있으므로 아래 메모로 함께 공개합니다. 실제 양식 설명이 iframe까지 원격 코드로 포함한다면 이 차이를 숨기지 말고 해당 설명을 대조한 뒤 입력합니다.

```text
All extension executable JavaScript and localization rules are bundled in the package. The extension does not download or execute remote JavaScript/Wasm in its extension context. Translation uses the browser-provided Translator API; Microsoft Edge manages any model downloads. The extension embeds ordinary Mountain Project map and route-statistics pages in web iframes. Those pages may load and run the original website's resources, without access to extension APIs. No fetched scripts are injected into the extension context.
```

데이터 문항은 **기기 내 접근·이용과 개발자 전송을 구분**합니다. 아래 구현 근거를 실제 문항의 정의에 맞춰 사용하고, “아무 데이터에도 접근하지 않음”으로 답하지 않습니다.

| 범주 | 실제 처리와 입력 기준 |
| --- | --- |
| Website content | 본문·댓글·링크·DOM 읽기 및 로컬 번역. 로컬 접근·사용을 포함하면 해당 |
| Web history | 현재 Mountain Project URL·링크와 정제한 진단 경로 사용. 전체 방문 기록은 읽지 않지만 현재 URL을 포함하는 정의이면 해당 |
| Personally identifiable information | 페이지 사용자명·게시물 내 정보가 로컬 처리에 포함될 수 있음. 문의 이메일로 사용자가 직접 제공한 정보는 개발자가 수신 |
| Personal communications | 공개 댓글·포럼·등반 메모를 처리. 사서함·개인 메시지 수집 기능은 없음. 공개 게시물을 포함하는 정의인지 확인 |
| Location | GPS 위치 추적 없음. 게시물의 지명·좌표와 원본 사이트 요청에 수반되는 IP를 구분하여 공개 |
| Authentication information | 비밀번호·인증 토큰·쿠키 API로 수집하지 않음. 일반 사이트 iframe 요청의 쿠키 사용까지 없다고 주장하지 않음 |
| User activity | 번역·표시 제어를 위한 DOM 변화·클릭·키 입력 이벤트를 사용하지만 키 입력 내용이나 클릭 이력을 기록·전송하지 않음 |
| 금융·건강 정보 | 이를 별도로 수집하는 기능 없음. 사용자가 게시물에 쓴 내용을 텍스트 처리에서 완전히 배제한다고 보장하지 않음 |

데이터를 판매하거나 맞춤 광고·신용/대출 판단에 쓰지 않습니다. 설명한 기능·지원 목적 외 이용·이전을 하지 않습니다. 게시자는 실제 운영도 이 공개 내용과 일치하는지 확인하고 양식의 확약에 답합니다. [개인정보처리방침 원본](privacy-policy.ko.md)

## 8. 심사자 안내 (Notes for certification)

```text
This is an unofficial Korean localization and navigation extension for Mountain Project. It is not affiliated with Mountain Project or onX. No test account, payment, API key, or login is required for the public-page test below.

1. Use desktop Microsoft Edge. Install the submitted package and open https://www.mountainproject.com/ . With no saved setting, the extension starts OFF and highlights its top-page toggle. Turn the toggle labelled "확장 기능" ON.
2. The extension starts preparing Edge's built-in Translator API (English to Korean). The first model download may take time and requires network access and a user gesture. If ON was restored or enabled in the popup, click inside a supported article page to retry preparation. No experimental flags or third-party translation credentials are required by the extension.
3. Follow the top "대한민국" link. Once the model is ready, supported article text appears in Korean with "원문 보기" (show original) and "재번역" (translate again). Short titles may be replaced directly without these controls.
4. Expand the region map. Visit a public route such as https://www.mountainproject.com/route/105798994/high-exposure and check translated sections and route statistics. Map/statistics are ordinary Mountain Project web iframes and may make website requests using normal browser cookie rules. The extension itself only requests storage and the two Mountain Project HTTPS hosts.
5. Test original/retranslate controls, the popup OFF/ON switch, and reload to check setting persistence. OFF restores supported page content and removes added map/statistics frames; the top toggle and Korea link remain so users can enable the extension again.

If the device/browser/language pair cannot use Translator, the extension retains the original text and displays the applicable status. Fixed UI localization and navigation can still work. It does not fall back to a remote translation service. Page text is not sent to a developer server, persisted in extension storage, or used for analytics. Edge controls its model downloads.

Privacy policy: https://mountain-project-korea-privacy.jeongjongyeol.chatgpt.site
Support: whdduf972@gmail.com
```

## 9. 제출 이후

최종 ZIP 수동 확인과 모든 필수 입력이 끝나면 계정 소유자가 **Publish**로 심사 제출합니다. 제출은 승인·공개 완료와 다릅니다. 심사 결과와 실제 공개 페이지·설치 가능 상태를 확인한 뒤 Edge 항목 ID·URL·버전을 출시 기록에 남깁니다. Chrome의 기존 스토어 ID를 Edge 항목에 사용하지 않습니다.
