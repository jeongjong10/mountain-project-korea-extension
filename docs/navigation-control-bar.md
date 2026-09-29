# 상단 컨트롤 바 — 현재 동작과 디자인 검토

코드 대조일: 2026-09-28. 현재 제품은 **1번 컨트롤 바** 구조를 사용합니다. 후속 사용자 컨펌에 따라 어두운 중성 바탕·흰 글자·밝은 파란색 조작부의 다크 버전을 적용했습니다. [현재 디자인 기준](design-system.md)

## 사용자 동작과 명칭

표시 이름과 switch의 접근성 이름은 **확장 기능**입니다. ‘번역 스위치’는 이전 명칭이며 현재 기능 범위를 충분히 설명하지 못합니다. 이 설정은 번역 외에도 페이지 유형에 따라 지도·루트 통계 표시, 섹션·목록·사이드바 개선 등을 함께 켜거나 끕니다. 개별 기능마다 별도 스위치를 제공하지는 않습니다.

| 요소·상태 | 현재 동작 |
| --- | --- |
| 확장 기능 ON | 해당 페이지에서 지원하는 기능을 활성화. 번역 엔진이 없어도 지원되는 고정 UI·탐색 기능은 동작 |
| 확장 기능 OFF | 페이지 기능 중단·복원. 상단 제어 UI와 대한민국 퀵링크는 유지 |
| 대한민국 | 중앙 `SOUTH_KOREA_AREA_URL`을 사용하는 같은 탭 링크. accessible name은 대한민국 |
| 팝업 | 같은 확장 기능 설정을 표시. 다크 팝업의 스위치 옆에 ‘켜짐 / 꺼짐’과 하단 상태 설명을 표시 |
| 초기 설정 읽기·저장 중 | 상단 스위치 일시 비활성화. 저장 실패 시 마지막 반영 상태로 복원하고 스위치 아래의 전체 폭 status 영역에 오류 안내 |
| destroy / content invalidation | observer, 삽입한 컨트롤·스타일, 설정 구독과 페이지 기능 정리 |

OFF는 브라우저 관리 화면에서 확장 자체를 비활성화하는 동작과 다릅니다. 제어 UI를 포함한 확장 실행 환경의 종료는 runtime destroy/invalidation 경계로 처리합니다.

## 현재 구현과 DOM 배치

어두운 공통 표면과 바깥쪽 7px 모서리, 가운데 구분선으로 두 항목이 하나의 바처럼 보입니다. ON은 파란색 토글, OFF는 회색 토글과 위치 변화로 구분합니다. 대한민국에는 태극 심벌을 표시합니다. hover·focus-visible을 제공하고, 작은 화면에서는 간격을 줄이고 헤더 줄바꿈을 허용합니다. 타이포·목적지 시안, 시안 선택 상태와 임시 비교 패널은 제품 코드에서 제거했습니다.

기본 탐색 범위는 `#header-container .header-container__user`입니다. `.user-img-avatar`가 포함된 사용자 메뉴 또는 비로그인 Sign In 링크를 찾습니다. 기본 구조에서 삽입 결과는 다음과 같습니다.

```text
.header-container__user
├── label.mp-nav-control   확장 기능 + input[type=checkbox][role=switch]
├── a.mp-nav-control       대한민국
├── #user                  원본 아바타/드롭다운 또는 Sign In
└── …                      기존 햄버거 등
```

두 컨트롤은 별도의 형제 노드입니다. 원본 아바타를 감싸거나 그 앵커 안에 넣지 않습니다. `#user`가 없는 지원 구조에서는 해당 navigation item 또는 앵커 앞에 삽입합니다. 링크의 원본 클릭 영역과 드롭다운은 유지됩니다. native checkbox의 checked 상태와 label/aria-label, Tab·Space 조작을 사용하며 장식용 SVG는 보조 기술에서 숨깁니다.

## 설정 및 수명주기

1. `content.ts`가 WebExtension 저장소, 페이지 application, `NavigationControls` shell을 runtime에 주입하고 비동기 시작 전에 invalidation 해제를 연결합니다.
2. runtime은 shell을 마운트하고 설정 변경을 구독한 뒤 초기 값을 읽습니다. 저장값이 없으면 ON입니다.
3. 상단 또는 팝업에서 변경하면 `runtime.setEnabled()`가 `WebExtensionSettingsRepository.setEnabled()`로 저장합니다. 저장 완료 또는 저장소 변경 통지로 페이지 기능과 shell 표시를 갱신합니다.
4. `storage.local.enabled` 변경 구독으로 같은 프로필의 실행 중인 콘텐츠와 열린 팝업을 맞춥니다. `storage.sync`나 별도의 디자인 저장값은 사용하지 않습니다.
5. OFF는 `page.disable()`만 수행하고 shell을 보존합니다. `runtime.destroy()`는 구독 해제, shell 제거, 페이지 destroy까지 수행합니다.

watch가 초기 조회보다 먼저 도착한 경우와 저장 완료가 늦는 경우에는 revision으로 최신 설정을 보존합니다. 종료 후 도착한 결과로 페이지를 재활성화하지 않습니다.

shell의 MutationObserver는 하나입니다. 헤더 내부 childList/subtree와 헤더 조상의 직계 자식을 관찰하여 헤더 교체를 감지합니다. 헤더가 없으면 documentElement/body의 직계 자식만 관찰합니다. 본문 전체의 subtree를 상시 관찰하지 않습니다. 마운트 대상별로 두 노드를 보관하고, 삭제된 대상은 정리하며, 이미 올바른 위치이면 다시 삽입하지 않습니다.

## 구현 파일

| 책임 | 파일 |
| --- | --- |
| DOM 마운트·설정 입력·observer·정리 | [navigation-controls.ts](../src/ui/navigation-controls.ts) |
| 최종 스타일·태극 심벌 | [navigation-control-style.ts](../src/ui/navigation-control-style.ts) |
| 사용자 메뉴 locator | [navigation.ts](../src/sites/mountain-project/dom/navigation.ts) |
| 대한민국 목적지 계약 | [south-korea.ts](../src/sites/mountain-project/contract/regions/south-korea.ts) |
| 설정·shell·페이지 수명주기 | [runtime.ts](../src/application/runtime.ts) |
| 페이지 기능 조립 | [mountain-project-application.ts](../src/application/mountain-project-application.ts) |
| 저장·변경 구독 | [settings-repository.ts](../src/platforms/webextension/settings-repository.ts) |
| 콘텐츠 조립 / 팝업 | [content.ts](../src/entrypoints/content.ts), [popup/main.ts](../src/entrypoints/popup/main.ts), [popup/index.html](../src/entrypoints/popup/index.html) |

## 검증과 남은 범위

다크 색상 적용 후 상단 바·팝업 설정 테스트 7개, production typecheck, Chrome MV3·Firefox MV2 빌드 및 출력 번들 smoke가 통과했습니다. 이번 적용 검사 기록 (로컬 참고: `design/review/navigation-approved-verification.json`).

- [navigation-controls.test.ts](../test/ui/navigation-controls.test.ts): 배치·순서·URL, 클릭 영역 보존, 중복 방지, OFF 유지, 설정 반영, 헤더 교체·늦은 생성, 복수 사용자 영역, 저장 실패, destroy 복원과 비교 패널 부재.
- [popup-settings.test.ts](../test/application/popup-settings.test.ts): 팝업의 외부 설정 반영·저장·구독 해제.
- [runtime.test.ts](../test/application/runtime.test.ts): 초기 조회·watch 경쟁, 저장 중 최신 변경, 종료 후 재활성화 방지 등 별도 runtime 회귀.
- Headless Chrome에서 선택 전 세 시안의 데스크톱·360px 샘플 헤더 렌더링을 확인했습니다. 실제 로그인된 Mountain Project와 모바일 실기기에서의 검증 완료를 의미하지 않습니다.

헤더의 지원 구조가 없으면 삽입을 건너뜁니다. 사이트 구조 변경, 실제 로그인/로그아웃 전환, 아바타·Sign In 메뉴, 키보드 포커스와 모바일 헤더·임베드 페이지에서의 실사용 확인은 계속 필요합니다.

현재 다크 버전 미리보기 (로컬 참고: `design/review/navigation-applied.html`)는 실제 컨트롤 코드와 재현한 주변 헤더를 사용합니다. 미리보기의 스위치는 데모 상태만 변경하며 확장 설정을 저장하지 않습니다. 미리보기 자료 구분과 재생성 방법 (로컬 참고: `previews/README.md`)을 참고하세요.
