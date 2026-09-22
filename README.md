# Mountain Project Korea Extension

Mountain Project를 대체하지 않고 현재 페이지의 데이터, URL, 계정 기능과 사용자 흐름을 유지하면서 한국어 중심 UI를 제공하는 브라우저 확장 프로젝트다.

## 개발

```bash
npm install
npm test
npm run typecheck
npm run build
npm run build:firefox
```

Chrome 개발 실행은 `npm run dev`, Firefox 개발 실행은 `npm run dev:firefox`를 사용한다.

## 첫 프로토타입 범위

- Mountain Project의 DOM 구조, 레이아웃, 스타일을 변경하지 않는다.
- 링크, form, 이벤트가 연결된 원본 노드를 교체하지 않는다.
- 내비게이션, 버튼, form 라벨, 섹션 제목 등 확장이 통제할 수 있는 고정 UI 문구만 제자리에서 번역한다.
- Extension을 끄면 번역한 모든 값을 원문으로 복원한다.
- 사용자 작성 콘텐츠 자동 번역과 새 UI Renderer는 후속 검증으로 남긴다.

## 구조

- `src/core`: 브라우저 API에 의존하지 않는 Detector, Adapter, Localization, Page Model, 포트
- `src/localization`: 원본 노드를 유지하는 direct 번역 적용과 복원
- `src/platforms`: WebExtension 공통 구현과 Chrome/Firefox/Safari별 구현
- `src/entrypoints`: WXT content script와 popup shell

첫 프로토타입은 direct 번역만 사용한다.
