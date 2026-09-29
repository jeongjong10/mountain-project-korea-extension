# 컨트롤 바 미리보기 자료

이 폴더의 HTML·PNG·생성 스크립트는 로컬 참고 자료이며 `.gitignore`로 공개 저장소에서 제외됩니다. 아래 파일명과 실행 방법은 해당 로컬 자료를 보유한 개발 환경에만 적용됩니다.

2026-09-28에 **1번 컨트롤 바**를 최종 선택했습니다. 현재 기능 사양은 [상단 컨트롤 바 문서](../docs/navigation-control-bar.md)에 있습니다.

| 파일 | 용도·시점 |
| --- | --- |
| [navigation-designs.html](navigation-designs.html) | 최종 1번만 표시하는 현재 미리보기. 파일명은 기존 미리보기 링크를 유지하기 위해 보존 |
| [build-navigation-preview.mjs](build-navigation-preview.mjs) | 현재 컨트롤 소스를 번들해 HTML을 재생성하는 스크립트 |
| [navigation-designs-desktop.png](navigation-designs-desktop.png) | 최종 선택 전 3개 후보를 비교한 데스크톱 기록. 현재 제품 화면을 뜻하지 않음 |
| [navigation-designs-mobile.png](navigation-designs-mobile.png) | 최종 선택 전 3개 후보를 비교한 360px 샘플 헤더 기록. 모바일 실기기 검증 자료가 아님 |

저장소 루트에서 의존성 설치 후 `node previews/build-navigation-preview.mjs`를 실행하면 HTML이 갱신됩니다. PNG는 자동 갱신하지 않습니다. HTML은 직접 브라우저에서 열어 데스크톱·모바일 너비를 전환하고 스위치 ON/OFF를 확인할 수 있습니다.

미리보기는 실제 `NavigationControls`와 스타일을 사용하지만, 주변 메뉴·로고·아바타는 배치 확인용 재현입니다. 스위치는 페이지 내 데모 상태만 바꾸며 `storage.local`에 저장하지 않습니다. 대한민국 링크는 실제 사이트 목적지로 이동합니다. 실제 확장에는 시안 선택기나 비교 패널이 없습니다.

생성 스크립트에 들어 있는 로컬 Windows 글꼴 경로는 스크린샷 환경용입니다. 해당 글꼴이 없거나 브라우저에서 접근하지 못하면 시스템 글꼴로 대체되므로 글자 폭이 다를 수 있습니다.


## 지역 디렉터리 — 원본 스타일 비교

`region-directory-designs.html`에서 MP 원본과 수정 화면을 비교합니다. 실제 사이트 CSS 스냅샷 `region-directory-native.css`를 사용합니다. 아시아·유럽·아메리카 탭, 모바일 너비, 확장 OFF 복원을 확인할 수 있습니다.

`node previews/build-directory-preview.mjs`로 재생성합니다. `region-directory-source.html`은 원본 목록 스냅샷이며 반응형 중복을 포함한 400개 링크가 있습니다. PNG는 별도 렌더링 기록입니다. 주변 페이지 전체와 실제 사이트 실시간 수치를 재현하지는 않습니다.

로컬 미리보기의 아시아·유럽 숫자는 빈칸이다. 실제 MP 페이지에서 사용자가 등록 수 불러오기 버튼을 누를 때만 상위 지역 HTML을 조회한다. 데스크톱·모바일 PNG는 모두 수동 조회 버튼이 있는 현재 화면이다. 현재 데이터 동작은 HTML과 구현 문서를 따른다.

[페이지별 배치 비교](guide-layout-audit/index.html)에서 홈페이지·Route Guide의 원본과 아시아·유럽·아메리카를 1440/768/390px로 확인할 수 있습니다. [검토 범위와 결과](../docs/region-directory-layout-audit.md), [현재 구현 명세](../docs/region-directory.md)를 함께 참고하세요.
