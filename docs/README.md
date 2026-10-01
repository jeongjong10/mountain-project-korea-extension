# 프로젝트 문서

첫 배포 버전 `0.1.0`의 구현을 마치고 Chrome 웹 스토어에 공개 출시했으며, 유지보수와 추가 개발은 계속합니다.

## 현재 안내

- [제품 소개와 설치](../README.md)
- [출시 현황](release-status.md): 심사·게시 및 GitHub 반영 상태
- [버전 변경 내역](../CHANGELOG.md)
- [개발 및 유지보수](development.md): 지원 범위, 명령, 구조와 검증 방법
- [웨일 프로토타입 보존 문서](whale-installation.md): 2026-10-01 개발 중단, 기존 설치·빌드 절차와 본문 번역 제한
- [Edge 설치 안내](edge-installation.md): 미출시 Desktop Edge MV3 개발 빌드와 번역 준비
- [소스·로컬 문서·Notion 동기화](documentation-sync.md): 문서 대응표와 갱신 절차
- [스토어 제출 문안](chrome-web-store.ko.md)
- [Edge Add-ons 제출 키트](edge-addons-submission.ko.md): 계정 등록, 업로드 파일, 소개·권한·심사자 안내
- [개인정보처리방침 원본](privacy-policy.ko.md) · [공개 방침](https://mountain-project-korea-privacy.jeongjongyeol.chatgpt.site/)

## 구현 참고

- [번역 런타임](translation-runtime.md)
- [번역 상태 안내](translation-status-notice.md)
- [내비게이션 컨트롤](navigation-control-bar.md)
- [지역 디렉터리](region-directory.md)
- [디자인 시스템](design-system.md)

## 출시 검증과 자료 보관

- [2026-10-01 웨일 호환성 검증](whale-validation-2026-10-01.md): 중단 결정, 빌드·ZIP·실브라우저 증거와 미검증 범위
- [2026-10-01 Edge 검증](edge-validation-2026-10-01.md): 패키징·자동 검사·사용자 확인·직접 관측과 미검증 범위
- [2026-09-29 소스·패키지 점검](release-source-audit-2026-09-29.md)
- [검증 기준 소스 해시](evidence/release-source-baseline-2026-09-29.json)
- [패키지 검사 결과](evidence/release-package-inspection-2026-09-29.json)

GitHub에는 현재 제품·개발 명세와 출시 검증 기준을 보관합니다. 과거 조사 보고서, 시안, 날짜별 캡처와 일회성 검토 스크립트는 기존 로컬 경로에 보존하고 Git 추적에서 제외합니다. 문서의 `로컬 참고` 경로는 새로 clone한 저장소에 포함되지 않습니다. 과거 커밋 이력은 변경하지 않습니다.
