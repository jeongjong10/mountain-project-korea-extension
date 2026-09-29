# onX / Mountain Project 문의 검토본

작성·공식 채널 확인: 2026-09-28. **발송 담당: 사용자 정종열.** 사용자가 “문의는 내가 알아서” 진행한다고 지정했다. 아래는 직접 발송할 때 사용할 검토본이며, Codex는 발송하거나 발송 승인을 다시 요청하지 않는다. 실제 발송 여부·접수번호·회신은 사용자에게서 확인되기 전까지 미확인으로 둔다.

발신자: **개인 개발자 정종열**. 회신 이메일: **whdduf972@gmail.com**. 이름은 사용자가 확정했으며 이메일은 기존 [개인정보처리방침](privacy-policy.ko.md)의 공개 문의처를 사용한다. 이 문서는 현재 로컬 구현을 설명하며, 예전 문의 초안의 “클릭해야 번역 시작”, “layout mode 저장” 설명을 대체한다.

## 발송 경로

| 순서 | 경로 | 확인 내용과 입력안 |
| --- | --- | --- |
| 1 | [Mountain Project Help → Contact Us](https://www.mountainproject.com/help) | 공식 페이지에서 Email Address, Message, Send Message와 reCAPTCHA 안내 확인. Bug Report는 No. 이메일에 위 주소, Message에 아래 제목과 본문을 함께 입력한다. 실제 제출은 하지 않았다. |
| 2 | [onX Business Inquiries](https://www.onxmaps.com/business-inquiries) | 공식 페이지가 사업 문의 양식을 안내하며 JavaScript 필요를 명시한다. 현재 추출에서는 실제 필드·필수값이 보이지 않는다. MP가 담당 부서로 연결하지 못할 때 같은 문의의 전달 경로로 사용한다. 회사 정보가 필요하면 개인 개발자로 사실대로 표기한다. |
| 보조 | [admin@adventureprojects.net](mailto:admin@adventureprojects.net) | [공식 약관 §28](https://www.adventureprojects.net/ap-terms)에 Adventure Projects 문의 주소로 명시. 양식 실패나 후속 회신 연결 시의 대안이다. |
| 보조 | [support@onxmaps.com](mailto:support@onxmaps.com) | 같은 §28의 일반 문의 주소. 허가를 확정할 권한이 있는 담당자라는 뜻은 아니며 담당 부서 연결을 요청한다. |

동일 문의를 여러 경로로 한꺼번에 보내지 않고 첫 접수번호·회신을 기준으로 후속 전달한다. `copyright@onxmaps.com`은 해당 약관에서 침해 신고용으로 안내하므로 이 일반 사용 문의의 기본 수신처로 지정하지 않았다. 로그인·reCAPTCHA 등 사람의 확인이 필요하면 그 단계에서 사용자가 완료한다.

## 영문 제목·본문

**Subject: Request for guidance on an unofficial Korean-language Mountain Project browser extension**

```text
Hello Mountain Project / onX team,

My name is 정종열, an independent developer. I am developing “Mountain Project Korea (Unofficial),” a Chrome extension to help Korean-speaking climbers read and navigate Mountain Project. It is not affiliated with or endorsed by Mountain Project or onX. Before distributing a Chrome Web Store release, I would like to confirm whether the implementation below is acceptable and what conditions or changes you require.

Current implementation:

• The extension runs on supported pages that a user visits on mountainproject.com. It localizes navigation and selected interface text, adds links to existing Mountain Project destinations, and adjusts supported page layouts. It is not a separate climbing-content website or a bulk-download service.

• The region directory also offers an explicit “Load climb counts” button. Only after the user clicks it, the extension requests the configured public Mountain Project area pages needed for the selected Asia or Europe panel and reads their published climb counts from the returned HTML. Requests omit credentials/cookies, use cache revalidation, and are deduplicated with at most two running concurrently. The fetched scripts are not executed; the parsed counts are kept in view memory and are not sent to a developer server. Switching continent tabs alone does not start these requests, and the Americas panel uses the original page's directory.

• When enabled, it automatically translates supported English authored text, including supported descriptions, comments, forum posts and route-statistics notes, using Chrome's on-device Translator API when available. Initial model setup may require a download and user interaction. Unsupported or failed translations retain the original. Translated sections offer original-text and user-requested retranslation controls. Long comments are split only at their original blank-paragraph boundaries and are displayed after all segments succeed; switching the extension off is designed to restore its page changes. Live compatibility testing is still in progress.

• The only persistently saved extension preference is an enabled/disabled flag in local browser extension storage; its default is enabled. Source text, translations and restoration records are held temporarily in page/frame memory. The extension has no developer-operated translation server or analytics service.

• On supported area and route pages, it embeds Mountain Project's original /map/... and /route/stats/... pages as iframes inside Mountain Project pages. These are ordinary original-site documents, not copied map images or a separately hosted map service. Their normal network requests, scripts and applicable browser cookies/site data still operate.

• To fit those embedded views, the current code hides the iframe's site header, print header, footer, selected title/breadcrumb and advertising regions. The stats iframe also hides its cookie-consent banner. The route layout hides identified onX promotional and photo-carousel regions. This does not disable consent scripts or establish that consent is shared between the parent and frame. Live map attribution visibility and consent behavior have not yet been confirmed; I would appreciate your guidance on the notices and controls that must remain visible.

• The extension package does not bundle Mountain Project route photos or downloaded MP/onX logo files. Separately, the public development repository currently contains some reduced page/test snapshots with contributor names or text. Local demo materials also include reproduced branding and site-derived directory/style material; these are being reviewed separately from the extension package. I do not assume that any approval for the extension covers those materials or contributors' rights.

Could you please advise:

1. Whether this local translation and page-layout behavior is permitted, or whether a specific written agreement is needed before distribution.
2. Whether the same-site map/stats embedding and the listed hidden elements are acceptable, and which branding, attribution, advertising or consent elements need to be preserved.
3. Whether “Mountain Project Korea (Unofficial)” is acceptable naming, and what disclaimer or attribution you prefer in the extension and store listing.
4. What limits apply to publicly sharing development fixtures or demo screenshots containing site/contributor content, and whether separate contributor or map-provider permission is needed for particular materials.

The development repository is https://github.com/jeongjong10/mountain-project-korea-extension. Its published revision is older than the local implementation described above; it should not be treated as the final build. I can provide a specific review build and a scoped demonstration if helpful.

If your team is not the appropriate contact, please forward this inquiry or let me know whom to contact. Thank you for your guidance.

정종열
Independent developer
whdduf972@gmail.com
```

## 사용자가 확인할 내용

- 사용자가 위 본문을 확인하고 **MP Help의 Contact Us로 1회 접수**한다. 이름·이메일은 확정됐으며 Codex에 별도 발송 승인을 줄 필요는 없다. 발송 후 접수번호나 회신이 있으면 작업카드에 연결한다.
- 필요한 경우 reCAPTCHA·로그인 단계만 직접 수행. 계정 비밀번호나 인증번호를 문서에 적지 않는다.
- 공개 소스·데모의 구체적 처리안은 [자산 검토의 현재 공개 범위](asset-and-attribution-review.md#public-source-and-demo-follow-up--2026-09-28)를 참고한다. 이 문의가 허가 필수 여부를 법률적으로 확정하는 것은 아니다.

## 본문과 구현의 대조 근거

| 본문 항목 | 로컬 근거 |
| --- | --- |
| 기본 ON, `enabled`만 `storage.local` 저장 | [settings-repository.ts](../src/platforms/webextension/settings-repository.ts) |
| 등록 수 버튼 클릭 후 선택한 아시아·유럽의 지정 MP 공개 페이지 조회 | [directory-counts.ts](../src/sites/mountain-project/dom/directory-counts.ts), [region-directory.ts](../src/ui/region-directory.ts). `credentials: 'omit'`, `cache: 'no-cache'`, 중복 요청 제거·동시 2개, 탭 전환 자체는 조회하지 않음 |
| 지원 콘텐츠 자동 번역, 모델 준비 시 사용자 동작 대기 | [application](../src/application/mountain-project-application.ts), [controller](../src/localization/page-translation-controller.ts), [Chrome provider](../src/platforms/chrome/chrome-translation-provider.ts) |
| 원문 보기·OFF 복원 | [renderer](../src/rendering/original-preserving-renderer.ts), application의 disable 처리 |
| 원본 사이트 지도·통계 iframe | [area map](../src/ui/area-map-embed.ts), [map embedding](../src/ui/south-korea-map-embed.ts), [stats embedding](../src/ui/route-stats-embed/layout.ts) |
| 프레임 헤더·푸터·광고·stats 배너 숨김 | [map selectors](../src/sites/mountain-project/contract/selectors/map.ts), [stats selectors](../src/sites/mountain-project/contract/selectors/stats.ts), [shared selectors](../src/sites/mountain-project/contract/selectors/shared.ts) |
| 패키지와 공개 저장소·데모의 구분 | [asset review](asset-and-attribution-review.md), 원격 main `27bc57526e60a47f368d462040b215c9fba8b222` 읽기 확인 |

본문의 동작 설명은 소스 확인 결과이며 성공한 실기기 검증을 대신하지 않는다. 실페이지 검증이 끝나면 미확인 문장을 그 결과에 맞춰 갱신하고, 발송된 정확한 본문·일시·채널·접수번호·회신을 이 문서 또는 작업카드에 남긴다. 이번 작성에서는 외부 발송·폼 제출·저장소 게시·Notion 변경을 수행하지 않았다.
