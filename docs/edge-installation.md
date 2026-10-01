# Desktop Edge 개발 빌드 설치

Desktop Microsoft Edge용 **미출시 개발 빌드** 안내입니다. 공개된 Chrome 웹 스토어 `0.1.0`과 구분합니다. 패키징과 첫 실행 확인만으로 전체 번역 지원이나 Edge Add-ons 출시 완료를 뜻하지 않습니다. 최신 확인 범위는 [Edge 검증 기록](edge-validation-2026-10-01.md)을 따릅니다.

## 설치와 업데이트

Node.js·npm 환경은 [개발 안내](development.md#로컬-설치-및-실행)를 따릅니다. 개발 기준 Node.js는 `22.23.2`입니다.

```bash
npm ci
npm run build:edge
```

1. 개발용 Edge 프로필에서 `edge://extensions`를 열고 **개발자 모드**를 켭니다.
2. **압축 풀린 파일 로드(Load unpacked)**에서 `.output/edge-mv3` 폴더를 선택합니다.
3. [Mountain Project](https://www.mountainproject.com/)를 열거나 이미 열린 페이지를 새로고침합니다.
4. 저장된 설정이 없으면 OFF와 상단 활성화 안내가 표시됩니다. **확장 기능** 스위치를 켭니다. 기존 boolean ON/OFF 설정이 있으면 유지합니다.
5. 업데이트 때는 같은 폴더에 다시 빌드하고 확장 관리 화면에서 새로고침한 뒤 MP 페이지도 새로고침합니다. 기존 설정을 보존하려면 확장을 제거·재설치하거나 다른 경로의 사본으로 바꾸지 않습니다.

일반 사용자 프로필의 설정을 지우지 않습니다. 압축 파일 자체가 아니라 `manifest.json`이 들어 있는 폴더를 선택합니다. 실제 검증 출발점은 기존 `.output/chrome-mv3`였으며, Edge용 산출물은 별도 경로로 관리합니다. 서로 다른 unpacked 경로·스토어 설치의 확장 ID와 저장소가 같다고 가정하지 않습니다.

## 번역 준비

메인·본문 지원 페이지의 상단 ON 입력에서 브라우저 번역 모델 준비를 시도합니다. 안내가 사라지는 것은 설정 저장 성공이며 모델 준비 완료와는 다릅니다. 준비가 끝나면 지원 본문이 한국어로 바뀌고 원문 보기·재번역을 사용할 수 있습니다. 팝업 ON이나 저장된 ON으로 진입한 경우에는 본문 페이지에서 일반 클릭·키 입력이 더 필요할 수 있습니다.

기존 `ChromeTranslationProvider`가 `globalThis.Translator`를 기능 감지하며 Edge도 같은 경로를 사용합니다. Edge 내장 페이지 전체 번역과 확장의 본문 번역은 별개입니다. 고정 메뉴의 한국어 표시, API 존재 또는 `downloadable` 응답만으로 실제 번역 성공을 판단하지 않습니다. API 미지원·준비 실패 때 본문은 원문을 유지하고 지원되는 고정 UI·탐색 기능은 따로 동작합니다. 실험 플래그를 변경하거나 외부 번역 서비스를 연결할 필요가 있다는 안내는 하지 않습니다.

## ZIP과 배포 기록

```bash
npm run zip:edge
```

타입 검사 → Edge MV3 빌드 → manifest·권한·참조 파일·출력 번들 smoke → 실제 ZIP 검사를 수행합니다. 현재 출력은 `.output/mountain-project-korea-extension-0.1.0-edge.zip`입니다. ZIP을 별도 폴더에 풀어 로드하면 해당 패키지를 직접 검사할 수 있습니다.

깨끗한 커밋으로 별도 배포 준비 기록을 만들 때 다음 명령을 사용합니다. 첫 Edge 제출 후보는 `0.1.0`으로 준비하며 Chrome 공개판과 배포 채널을 구분합니다.

```bash
npm run release -- prepare --browser edge
npm run release -- verify 0.1.0 --browser edge
```

`prepare`는 공통 전체 배포 검사 후 **`zip:edge`**를 선택하고 `.output/releases/edge/<버전>/`에 ZIP·schema 2 `release.json`·Edge 체크리스트를 생성합니다. 기록에는 `browser: "edge"`, Git 커밋·버전·해시·통과한 명령이 들어가며 Chrome 스토어 ID는 포함하지 않습니다. Chrome·Whale 기록을 Edge 기록으로 재사용할 수 없습니다. 같은 버전 기록은 덮어쓰지 않습니다.

`verify`는 현재 소스와 기록·ZIP을 대조하며 수동 실브라우저 확인을 대신하지 않습니다. `prepared`는 로컬 준비 상태입니다. 계정 생성부터 심사 제출까지는 [Edge Add-ons 제출 키트](edge-addons-submission.ko.md)를 따릅니다. 공용 작업 폴더에 다른 작업의 미커밋 변경이 있으면 고정된 소스 커밋의 별도 clone에서 `prepare`·`verify`를 수행하고, receipt와 ZIP을 함께 옮깁니다. 원래 작업 폴더의 다른 변경을 지우거나 검사 조건을 우회하지 않습니다.

## 근거

- [Microsoft: Chrome 확장 이전](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/port-chrome-extension)
- [Microsoft: 확장 로컬 설치](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading)
- [Microsoft: Translator API](https://learn.microsoft.com/en-us/microsoft-edge/web-platform/translator-api)
