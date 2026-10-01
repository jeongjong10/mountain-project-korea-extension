# 개발 및 유지보수

WXT와 TypeScript로 빌드하며 Vitest와 happy-dom으로 테스트합니다. 개발용 Node.js 버전은 [package.json](../package.json)에 지정된 `22.23.2`입니다. 아래 명령은 WSL 또는 Linux/macOS의 셸을 기준으로 합니다.

## 환경 설정

```bash
git clone https://github.com/jeongjong10/mountain-project-korea-extension.git
cd mountain-project-korea-extension
npm ci
npm run build
```

`build`의 타입 검사 단계에서 WXT 설정과 타입을 생성합니다. `node_modules/`, `.wxt/`, `.output/`는 생성 디렉터리입니다. 여러 브라우저 빌드를 병행할 때는 별도 작업 사본을 사용해 이 디렉터리들을 공유하지 않습니다.

## 브라우저에 설치하기

| 대상 | 빌드 명령 | 설치할 파일 |
| --- | --- | --- |
| Chrome | `npm run build` | `.output/chrome-mv3/` |
| Edge | `npm run build:edge` | `.output/edge-mv3/` |
| Firefox | `npm run build:firefox` | `.output/firefox-mv2/manifest.json` |

Chrome은 `chrome://extensions`, Edge는 `edge://extensions`에서 개발자 모드를 켜고 해당 폴더를 압축해제된 확장으로 로드합니다. Firefox는 `about:debugging#/runtime/this-firefox`의 임시 부가 기능 로드에서 manifest를 선택합니다. 임시 부가 기능은 브라우저를 종료하면 제거되지만 저장된 설정은 남을 수 있습니다. 최초 실행 상태를 확인할 때는 새 개발 프로필을 사용합니다.

소스를 수정한 뒤 다시 빌드하고 확장 관리 화면과 MP 페이지를 새로고침합니다. 설정을 유지하려면 같은 폴더를 사용합니다. 자동 재빌드는 `npm run dev`와 `npm run dev:firefox`로 실행합니다.

현재 패키지 `0.1.1`과 Edge·Firefox 산출물은 미출시 개발용이며 공개 Chrome `0.1.0`과 구분합니다. 빌드 대상과 본문 번역 지원은 별개입니다. 공통 provider는 콘텐츠 스크립트의 Translator API를 사용하며 Firefox 전용 번역 provider나 Firefox 자체 페이지 번역과의 연결은 없습니다. Firefox 본문 번역 지원을 전제로 배포하지 않습니다. `gecko_android` 설정도 Android 기능 지원을 보장하지 않습니다. Whale은 지원 대상에서 제외되어 있습니다.

## 테스트

```bash
npm run check
npm run test:release
npm run build
git diff --check
```

| 명령 | 검사 범위 |
| --- | --- |
| `npm run typecheck` | WXT 설정 생성과 제품 TypeScript |
| `npm run typecheck:test` | 테스트 TypeScript |
| `npm test` | Vitest 단위·DOM 테스트 |
| `npm run check` | 제품·테스트 타입과 Vitest |
| `npm run test:release` | 배포 도구와 패키지 검사 |
| `npm run build` | 제품 타입, Chrome 빌드, 출력 content script 실행 |
| `npm run build:edge` | 제품 타입, Edge 빌드, manifest·파일 참조, 출력 content script 실행 |
| `npm run build:firefox` | 제품 타입, Firefox MV2 빌드, 출력 content script 실행 |

`test:release`는 `check`에 포함되지 않습니다. `npm test`는 `TMPDIR=/tmp` 문법을 사용하므로 POSIX 셸이 필요합니다. PowerShell에서는 `npx vitest run`으로 Vitest를 직접 실행할 수 있습니다.

출력 번들 검사는 [content-script-smoke.mjs](../test/build/content-script-smoke.mjs)가 manifest의 실제 content script를 happy-dom에서 실행합니다. 테스트 코드는 [test/](../test/)에 있으며 제품 번들에 포함하지 않습니다.

배포할 패키지는 별도 브라우저 프로필에 설치해 본문 번역, 원문 보기·재번역, ON/OFF와 새로고침 후 설정, 지도·통계, 로그인 상태별 헤더와 기여 폼을 확인합니다. 자동 DOM 테스트에는 실제 번역 모델 다운로드와 운영 사이트의 네트워크·로그인 동작이 포함되지 않습니다.

## 패키징과 배포

일반 ZIP 생성에는 `npm run zip` 또는 `npm run zip:edge`를 사용합니다. 두 명령은 빌드와 패키지·출력 번들·실제 ZIP 검사를 수행합니다.

Firefox는 `npm run build:firefox` 후 `npx --no-install wxt zip -b firefox`로 패키지와 소스 ZIP을 생성합니다. 이 ZIP은 서명된 정식 배포판이 아닙니다. 공통 `release prepare / verify` 도구는 Firefox를 지원하지 않습니다. 재현 빌드는 고정한 소스와 lockfile을 별도 디렉터리에서 `npm ci`로 설치해 실행하고, ZIP 내부 파일의 이름·크기·해시를 대조합니다. ZIP 컨테이너 메타데이터는 달라질 수 있습니다.

브라우저별 manifest는 [wxt.config.ts](../wxt.config.ts)를 기준으로 합니다. 공개 배포 전에는 해당 소스의 권한·데이터 선언·개인정보 방침과 실제 요청·설치 동작을 대조합니다. 임시 설치와 자동 DOM 검사는 정식 설치의 권한·데이터 동의 화면 검증을 대신하지 않습니다.

버전별 배포 패키지는 [release.mjs](../scripts/release.mjs)로 관리합니다.

1. `npm run release -- version <새 버전>`으로 package와 lockfile의 버전을 함께 올립니다. 새 버전은 현재 소스와 스토어 버전보다 높게 정합니다. 도구는 스토어 버전을 조회하지 않습니다.
2. [CHANGELOG.md](../CHANGELOG.md)에 `## <버전> — 변경 요약` 제목과 제품 변경 내용을 작성하고 소스·문서를 커밋합니다.
3. `npm run release -- prepare`를 실행합니다. Edge는 `npm run release -- prepare --browser edge`를 사용합니다.
4. 생성된 ZIP을 별도 프로필에 설치해 동작을 확인하고, `npm run release -- verify <버전>`으로 소스와 ZIP의 일치를 확인합니다. Edge에는 `--browser edge`를 붙입니다.
5. 확인한 ZIP을 해당 스토어에 업로드하고 공개된 버전을 변경 내역에 반영합니다.

`prepare`는 깨끗한 작업 트리에서 의존성 설치, 제품·테스트 타입, 배포 도구 테스트, 전체 Vitest, 브라우저 ZIP 검사 순서로 실행합니다. 실패하면 배포 기록을 만들지 않습니다. 같은 버전의 기존 기록도 덮어쓰지 않습니다.

| 대상 | 배포 산출물 경로 |
| --- | --- |
| Chrome | `.output/releases/<버전>/` |
| Edge | `.output/releases/edge/<버전>/` |

폴더에는 ZIP, 소스 커밋·파일 해시·검사 결과를 담은 `release.json`, 수동 확인용 `CHECKLIST.md`가 생성됩니다. 산출물은 Git 추적에서 제외합니다. `verify`는 재빌드하지 않으며 준비 이후 소스 커밋·버전·ZIP이 바뀌면 실패합니다. Git 푸시와 스토어 업로드는 별도로 수행합니다.

## 유지보수

사이트의 URL·문구·화면 구조 변경은 [프로젝트 구조](architecture.md#사이트-변경-대응)에 따라 수정합니다. 동작이 바뀌면 담당 명세와 관련 테스트를 함께 갱신합니다. 권한·저장·통신이 바뀌면 [개인정보처리방침](privacy-policy.ko.md)과 [공개 방침 HTML](../privacy-site/index.html)도 대조합니다.
