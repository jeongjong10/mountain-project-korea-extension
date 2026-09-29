# 번역 전처리 1차 개선 — 2026-09-29

## 변경

일반 등반 용어와 구절을 토큰으로 가리거나 고정 한국어로 복원하는 경로를 제거했다. `route wanders`에 원문에 없는 앵커를 추가하던 사전 항목과 `rope drag`, `bolt ladder` 등의 무조건 영문 보존 예외도 제거했다. 고정 UI 라벨 사전은 별도이며 그대로 유지한다.

DOM에서 확인된 고유명사, 기존 기술 값 패턴과 구조 토큰은 유지한다. 일반 단어라도 DOM에서 실제 이름으로 확인되면 보호한다. 문단 분할·번역 엔진·렌더러·원문 보기 UX는 기존 경계를 유지한다. 정책 버전은 `mpkr-policy-5`, 용어 정책 버전은 `mpkr-climbing-ko-3`으로 올려 캐시를 구분한다.

범위는 전처리 개선이다. 기술 값 패턴의 모든 등급 변형·장비 호수에 대한 완전한 지원을 새로 구현하거나 검증했다고 주장하지 않는다. 문맥 병합·추가 엔진·후처리 LLM은 포함하지 않았다.

## 비교 자료

- `design/review/translation-policy-baseline-2026-09-29.json`: 변경 전 소스와 평가 자료 스냅샷. 실제 엔진 출력이 아니다.
- `test/fixtures/mountain-project/translation-quality-corpus.ts`: 합성 원문 40개와 사람의 검토를 위한 의미 힌트. 힌트는 고정 정답이나 엔진 실측 결과가 아니다.
- `test/manual/build-translation-comparison.mjs`: 보존한 이전 정책·현재 정책·전처리 없는 API 비교 페이지 생성기.
- `design/review/translation-comparison.html`: 생성한 비교 페이지. 실제 API를 순차 호출하고 결과·입력·오류·시간을 JSON으로 내보낸다. 정책별 호출 순서는 회전하지만 엄밀한 성능 벤치마크는 아니다. DOM 통합 검증은 별도 자동 테스트가 담당한다.

실행 방법: 저장소 루트에서 `node test/manual/build-translation-comparison.mjs`, 이어서 `node design/review/translation-comparison-server.cjs`를 실행한다. 출력된 포트의 `http://127.0.0.1:<port>`를 Chrome에서 열고 비교 시작 버튼을 누른다. 끝나면 서버를 Ctrl+C로 종료한다. 생성 페이지는 사이트나 계정 데이터를 수정하지 않는다.

Chrome 메뉴 페이지 번역은 별도 원문 페이지에서 측정해야 한다. 이 비교 도구의 세 경로 결과를 메뉴 번역 결과로 취급해서는 안 된다. 공개 지원 사례와 적용 전략은 `translator-api-strategy-research-2026-09-29.md`에 정리했다.

## 실브라우저 확인과 한계

소유한 별도 Chrome 프로필에서 비교 페이지 로드 및 `Translator.availability(en→ko) = downloadable`을 확인했다. Windows Computer Use 도구가 WSL `sandboxCwd` URI를 거부해 UI 조작 전에 실패했다. 언어팩 준비·실제 번역 호출·메뉴 번역 비교는 수행하지 못했다. 따라서 한국어 품질 개선, Chrome 페이지 번역 대비 우월성, 지연 개선은 미검증이다.

별도 Chrome·임시 프로필은 래퍼의 cleanup removed 이벤트로 정리했고, 비교 서버도 종료 후 연결 실패로 확인했다. 기존 브라우저는 접근하거나 종료하지 않았다. 비교 소스·페이지·소유 기록은 검토 산출물로 유지한다.

## 채택 기준

실제 결과를 출처를 가리고 비교하여 의미 정확도·자연스러움·용어 적절성을 평가한다. 새 중대 의미 오류 0건, 필수 값·서식 보존 100%, 현행보다 의미·자연스러움 개선을 기준으로 한다. 부정·방향·조건·수치·위험도 변형과 원문에 없는 정보 추가는 별도 오류로 기록한다. 평가에 쓰지 않은 장문·서식·다의어 원문도 추가해 최종 확인해야 한다.

자동 테스트는 원문 전달·보호·복원·DOM·캐시 동작의 근거이며 의미 품질의 근거가 아니다.

## 자동 검증 결과

- 관련 정책·통합 테스트: 64개 통과.
- 제품 및 테스트 TypeScript 검사: 통과.
- 전체 테스트: 632개 중 631개 통과, 댓글 가시성 1개가 5초 제한 초과. 해당 파일을 단독 재실행해 5개 모두 통과(문제 테스트 약 1.74초). 이 테스트는 변경한 번역 정책을 주입하지 않는다. 전체 실행이 완전히 통과했다고 표시하지 않는다.
- `git diff --check`: 통과.
- Chrome MV3 및 Firefox MV2 프로덕션 빌드와 번들 smoke 검사: 모두 통과. Firefox 빌드 성공은 Translator API 지원 확인을 의미하지 않는다.

## 재시도 결과 — 2026-09-29

사용자 요청에 따라 Windows Computer Use의 JavaScript 커널을 초기화한 뒤, 공식 진입점 `@oai/sky` 가져오기를 다시 실행했다. 커널 초기화는 성공했지만 JavaScript 코드 실행 전에 다시 `-32602` 오류가 발생했다. 오류는 `codex/sandbox-state-meta: sandboxCwd is not a local file URI`이며 현재 WSL 작업 경로의 `file:///mnt/c/...` URI를 가리킨다. 브라우저나 번역 API 자체의 오류로 판정할 근거는 없다.

현재 도구 목록에는 대체 브라우저 조작 도구가 없었다. `open_in_codex`는 패널을 여는 기능이며 실제 Chrome UI 조작을 대신하지 않는다. 필수 사용자 동작을 발생시키기 위한 임의 CDP 평가나 Windows 입력 우회는 수행하지 않았다.

이번 재시도에서 번역 결과는 0개이며 실제 품질 비교는 여전히 미완료다. 조작 도구 사전 점검에서 막혔으므로 새 서버·브라우저·프로필·CDP 포트는 만들지 않았고 기존 브라우저에도 접근하지 않았다. 제품 코드는 수정하지 않았다. 재현 증거는 `design/review/translation-comparison-retry-2026-09-29.json`에 남겼다.

복구 경로도 확인했다. `node_repl/js`의 지원 인자는 `code`, `timeout_ms`, `title`이고 작업 디렉터리나 sandbox URI를 바꾸는 인자는 없다. `js_reset`은 커널만 초기화하므로 경로 오류를 해소하지 못했다. 재개하려면 호스트가 제공하는 `sandbox-state-meta`의 작업 경로 URI를 Windows 도구 런타임이 수용하도록 경로 매핑이 수정되어야 한다. 현재 세션에는 이를 수정하는 지원 도구가 노출되지 않았다. 앱 재시작·새 채팅·프로젝트 이동의 해결 효과는 검증하지 않았으므로 확정 해결책으로 제시하지 않는다.
