# 암벽등반 가이드 페이지별 배치 검토

조회일: 2026-09-28. 공개 비로그인 대표 페이지 18개를 조사했다. 모든 URL·로그인 상태에 대한 전수조사를 뜻하지 않는다.

## 실제 발견 위치

- 홈페이지 `/`: Rock Climbing Guide 제목, 파란 구분선, 흰 배경. 다음 Climbing Map 앞.
- `/route-guide`: Climbing Directory 제목과 회색 박스 내부. 다음 지도 앞.
- 두 페이지 모두 `#route-guide` 1개이며 조사 당시 반응형 중복을 포함한 원본 링크 400개.

## 비교 결과

1440 / 768 / 390px × 원본 / 아시아 / 유럽 / 아메리카 × 두 페이지 = 24개 화면을 렌더링했다.

- 모든 조합에서 가이드와 문서의 가로 넘침 없음.
- 아시아·유럽 4/2/1단 배치. 국가 묶음의 들여쓰기와 페이지 고유 배경 유지.
- 아메리카 선택 시 원본 마크업·링크·부모 노드 보존. OFF 후 원본 마크업 일치.
- 모바일은 한 단이므로 아시아 목록이 약 1,206px로 길다. 잘림이 아니라 전체 목록 유지에 따른 세로 스크롤이다.
- 두 페이지의 원본 배치 차이를 유지하므로 같은 픽셀 여백·배경으로 강제 통일하지 않았다.
- 가이드 전용 컴포넌트의 배치를 검토했다. 로그인·광고·지도·번역·다른 확장 기능이 함께 동작하는 실제 세션까지 검증한 것은 아니다. 원격 리소스를 차단한 HTML 스냅샷이므로 이미지 누락과 지도 빈칸은 검토 환경 제한이다.

[페이지·화면 폭·탭별 비교 화면](../previews/guide-layout-audit/index.html)

## 공개 페이지 조사

| URL | HTTP | 가이드 수 |
| --- | ---: | ---: |
| [/](https://www.mountainproject.com/) | 200 | 1 |
| [/route-guide](https://www.mountainproject.com/route-guide) | 200 | 1 |
| [/route-finder](https://www.mountainproject.com/route-finder) | 200 | 0 |
| [/area/105907743/international](https://www.mountainproject.com/area/105907743/international) | 200 | 0 |
| [/area/106661515/asia](https://www.mountainproject.com/area/106661515/asia) | 200 | 0 |
| [/area/106225629/south-korea](https://www.mountainproject.com/area/106225629/south-korea) | 200 | 0 |
| [/area/105833388/yosemite-valley](https://www.mountainproject.com/area/105833388/yosemite-valley) | 200 | 0 |
| [/route/105872668/whitney-gilman-ridge](https://www.mountainproject.com/route/105872668/whitney-gilman-ridge) | 200 | 0 |
| [/route/stats/105872668/whitney-gilman-ridge](https://www.mountainproject.com/route/stats/105872668/whitney-gilman-ridge) | 200 | 0 |
| [/gyms](https://www.mountainproject.com/gyms) | 200 | 0 |
| [/whats-new](https://www.mountainproject.com/whats-new) | 200 | 0 |
| [/partner-finder](https://www.mountainproject.com/partner-finder) | 200 | 0 |
| [/forum](https://www.mountainproject.com/forum) | 200 | 0 |
| [/forum/103989405/general-climbing](https://www.mountainproject.com/forum/103989405/general-climbing) | 200 | 0 |
| [/forum/topic/202347384/socal-guidebooks](https://www.mountainproject.com/forum/topic/202347384/socal-guidebooks) | 200 | 0 |
| [/help](https://www.mountainproject.com/help) | 200 | 0 |
| [/user/110055598/lana-little](https://www.mountainproject.com/user/110055598/lana-little) | 200 | 0 |
| [/user/110055598/lana-little/contributions](https://www.mountainproject.com/user/110055598/lana-little/contributions) | 200 | 0 |
