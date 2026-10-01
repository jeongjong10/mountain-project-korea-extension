# 소스·로컬 문서·Notion 동기화

## 공통 기준

2026-09-30: 첫 배포 버전 `0.1.0`의 심사 승인 및 공개 출시를 확인했다. [Chrome 웹 스토어에서 설치](https://chromewebstore.google.com/detail/mountain-project-korea-%EB%B9%84%EA%B3%B5/ijgghnbmgbapfckfnkcapbkbbobjochh). 첫 버전 이후에도 오류 수정, 번역 품질·사용성 개선과 추가 개발을 계속한다. 로컬 문서와 Notion에 설치 링크·공개 확인 상태를 함께 반영한다.

## 문서 대응표

| 관리할 내용 | 로컬 기준 | Notion 기준 |
| --- | --- | --- |
| 제품 소개·출시 요약 | `README.md`, `docs/release-status.md`, `CHANGELOG.md` | [프로젝트 허브](https://www.notion.so/3dc58ad3a0b281bfa46dcc66cc226b5a), [01. 제품 정의·범위](https://www.notion.so/3e958ad3a0b28118b3a8e4aaffd0215d) |
| 구조·수명주기·플랫폼 경계 | `src/application/`, `src/core/`, `src/platforms/`, `docs/development.md` | [02. 시스템 아키텍처 정의서](https://www.notion.so/3e958ad3a0b2811ca44ef632f49568f1) |
| 기능·번역 정책 | `src/sites/`, `src/localization/`, `src/rendering/`, `src/ui/`, `docs/translation-runtime.md` | [03. 기능·번역 명세](https://www.notion.so/3e958ad3a0b28111b58bfc78d8f998ad) |
| 설치·빌드·검증 명령 | `package.json`, `test/build/`, `docs/development.md` | [04. 개발·유지보수 기준서](https://www.notion.so/3e958ad3a0b28137a781eee539811779) |
| 검증·개인정보·게시 상태 | `docs/release-source-audit-2026-09-29.md`, `docs/evidence/`, `docs/privacy-policy.ko.md`, `docs/chrome-web-store.ko.md` | [05. 검증·개인정보·공개 배포 기준](https://www.notion.so/3e958ad3a0b281f98407f652a951ef1b) |
| 변경 이유·동기화 규칙 | `CHANGELOG.md`, 이 문서 | [06. 결정 기록·문서 관리](https://www.notion.so/3e958ad3a0b2817d946ed2c5ea8d5fb1) |

## 현재 로컬 소스 대조 — 2026-10-01

- 공개된 `0.1.0`과 미출시 개발 소스를 구분했다. 현재 패키지 버전은 여전히 `0.1.0`이며 이 동기화에서 버전 변경·스토어 제출을 수행하지 않는다.
- `enabled` 키 부재를 기본 OFF·첫 실행 기준으로 기록했다. 저장된 boolean 설정은 유지하지만 이전 설치도 키가 없으면 첫 실행이다. 스위치 강조 해제는 설정 저장 반영에 따르며 Chrome 번역 준비 성공과 구분한다.
- 메인·본문 번역 지원 페이지 상단 ON의 동기 준비 호출, 본문 페이지의 일반 클릭·키 입력 재시도, 별도 준비 버튼 미노출, 팝업 ON의 사용자 활성화 제한을 현재 코드와 대조했다. 메인은 준비만 시도하며 본문 컨트롤러를 시작하지 않고, 다른 고정 UI 전용 페이지는 준비를 호출하지 않는다. 저장 완료 시 revision을 확인하여 늦은 ON 저장 완료가 더 최신 키 삭제 상태를 덮어쓰지 않는 것도 확인했다.
- `scripts/release.mjs`의 로컬 버전 비교·깨끗한 커밋 요구·검증 순서·ZIP 재확인과 수동 단계를 개발 안내에 명시했다. `test:release`는 `npm test`·`npm run check`와 별도다.
- 소스·테스트 타입 검사, Chrome MV3·Firefox MV2 빌드와 출력 번들 smoke, 배포 도구 6/6 검사를 통과했다. 두 content script의 SHA-256은 `ed4cc58c64818c79c757943faed69a70d88ecebb2f04c39de6a55e2939c94477`이다. 최신 온보딩의 실제 Chrome 표시·언어팩 다운로드 완료는 아직 검증 증거가 없다.
- 전체 `npm test -- --maxWorkers=4`는 63개 파일의 664개 중 661개 통과했다. 댓글 가시성 검사는 5초 시간 초과, 동적 본문 갱신과 통계 iframe의 동적 링크 검사는 대기 후 기대값 불일치였다. 실패한 3개 파일만 코드·타임아웃 변경 없이 `--maxWorkers=1`로 순차 재실행해 38/38 통과했다. 병렬 실행의 비동기 검사 불안정성은 남아 있으며, 단일 전체 실행의 전수 통과로 표시하지 않는다.
- 재검사 명령: `npm test -- test/localization/comment-visibility.test.ts test/localization/page-translation-controller.test.ts test/ui/route-stats-embed/layout.test.ts --maxWorkers=1`. 관련 런타임 2개 파일의 36개 검사도 통과했다.
- Notion·GitHub 반영 상태는 아래 기록에서 확인한다. 이전 동기화·출시 검증 기록을 현재 소스의 검증 증거로 재사용하지 않는다.

## 출시 시점 대조 기준 — 2026-09-29

- `package.json` 버전 0.1.0, manifest의 비공식 제품명·storage 및 MP 두 HTTPS 호스트, Chrome Translator provider, 페이지 capability, 번역 보호 정책과 빌드 스크립트를 대조했다.
- `docs/evidence/release-source-baseline-2026-09-29.json`의 198개 기준 파일 해시가 모두 일치했다. `src/`, `test/`, `public/`의 기준 밖 추가 파일도 없었다. 소스를 수정하거나 새로운 기능을 구현한 작업은 아니다.
- 일반 본문 용어 강제 치환은 제거된 상태다. 정책은 `mpkr-policy-5`, 용어 정책은 `mpkr-climbing-ko-3`이며 고정 UI 사전·DOM에서 확인한 이름·기술 값·형식 보호를 유지한다.
- Help Hub Feature Request 제목·설명은 자동 번역·원문 확인·재번역 대상이며 작성자·투표 수·폼 입력값은 보존한다. 검색·파트너·포럼 등 지원 DOM의 작성 콘텐츠 번역도 기능 설명에 반영한다.
- 이전 검증의 61개 파일·634개 테스트 통과는 `--maxWorkers=4` 조건을 함께 기록한다. 이번 문서 편집 때문에 같은 테스트를 재실행했다고 표시하지 않는다.
- 과거 HOLD·미제출·용어집 실험·490개 테스트 기록은 이력으로 보존하고 현재 설명과 구분한다. 제출 사실을 외부 회신 확보나 미검증 항목 완료로 바꾸지 않는다.

## 출시 시점 동기화 결과 — 2026-09-29

프로젝트 허브와 기준 문서 01~06, 관련 작업 카드 3개(스토어 감사·공개 빌드 하드닝·과거 번역 용어집)를 갱신했다. Notion 재조회로 제품·출시 상태, 번역 정책과 빌드 설명의 반영을 확인했다. 스토어 감사 카드는 제출 후 확인을 이어가는 진행 중으로 변경했으며, 외부 회신이나 미검증 체크리스트를 일괄 완료로 바꾸지 않았다.

로컬 안내 문서 8개의 상대 링크 대상이 모두 존재하고 `git diff --check`를 통과했다. 소스·테스트·설정 198개 파일은 기존 출시 검증 기준과 일치하며 이번 문서 작업으로 변경하지 않았다.

## GitHub 반영 상태

2026-10-01 메인 작업에서 fetch 후 확인한 `main`·`origin/main`은 `997a6fa`다. 최초 OFF·온보딩·자동 준비·배포 도구와 이번 문서 변경은 아직 푸시 확인 전이며, 아래 `92f9040`은 출시 제품 소스 기준이다.

2026-09-29 최신 소스·테스트·문서·스토어 자산을 `main`의 [92f9040](https://github.com/jeongjong10/mountain-project-korea-extension/commit/92f9040)에 커밋하고 GitHub 푸시 성공을 확인했다. 날짜별 원본 브라우저 캡처·임시 프로필은 로컬에 유지한다. 원격 이력을 재작성하거나 스토어에 재제출하지 않았다. 현재 상태를 기록하는 문서 갱신은 후속 커밋으로 반영한다.

## 변경할 때의 순서

1. 구현된 기능·권한·저장·통신·버전을 소스에서 확인한다. 기획과 실제 구현이 다르면 차이를 기록한다.
2. README와 해당 로컬 명세·변경 내역을 수정한다. 현재 안내와 날짜별 검증 이력을 구분한다.
3. 대응하는 Notion 기준 문서의 기존 절을 갱신한다. 중복 페이지를 만들거나 과거 기록 전체를 최신 상태로 덮어쓰지 않는다.
4. Notion을 다시 읽어 반영 여부를 확인하고 로컬 링크·문서 형식을 검사한다. 권한·데이터 처리가 달라지면 개인정보처리방침과 스토어 문안도 함께 갱신한다.
5. Git 커밋·푸시를 완료한 시점에 원격 커밋을 확인하고 출시 현황과 Notion의 Git 상태를 갱신한다. 로컬 저장이나 Notion 갱신만으로 업로드 완료라고 표시하지 않는다.
6. 승인·공개 게시 후 대시보드와 설치 링크를 확인하여 출시일과 스토어 주소를 함께 반영한다.

이는 변경 시 적용하는 동기화 절차다. 별도의 자동 동기화 서비스나 예약 작업을 설치한 것은 아니다.

## 공개 저장소 범위 정리 — 2026-09-29

소스·자동 테스트·빌드 설정·현재 개발 명세·공개 방침·출시 검증 기준과 스토어 최종 이미지 4개를 GitHub에 유지한다. 시안 HTML·PNG·원본 디자인 자산·일회성 생성 도구와 수동 비교 도구, 이전 조사 보고서는 로컬 파일을 보존한 채 Git 추적에서 제외한다. 현재 문서의 관련 링크는 로컬 참고 경로로 바꾼다. 제외 자료의 과거 커밋 이력은 재작성하지 않는다.

이 정리는 제품 코드와 자동 테스트를 바꾸지 않는다. 출시 기준 198개 중 일회성 비교 도구 `test/manual/build-translation-comparison.mjs`만 공개 저장소에서 제외되며 로컬 기준 해시 검증에는 계속 존재한다. 새 clone에서 제품 빌드·자동 테스트는 해당 도구를 참조하지 않는다.

## 반복 배포 도구 — 2026-09-30

`npm run release -- version <버전>`, `prepare`, `verify <버전>`으로 버전 변경·자동 검증·제출 ZIP 확인을 반복한다. 상세 절차와 중단 조건은 [개발 안내](development.md#후속-버전-배포-도구)를 따른다. Notion 04 개발·유지보수와 05 검증·공개 배포 기준에 같은 명령과 수동 확인 범위를 반영한다. 도구는 Notion을 자동으로 수정하지 않으며, 릴리스별 문서 대조는 준비 전과 공개 확인 후 각각 수행한다.

도구 추가 자체는 새 제품 버전의 검증·배포가 아니다. 기존 미커밋 제품 변경은 보존하며, 전체 제품 검증은 해당 변경을 정리·커밋한 후 `prepare`로 수행한다.
