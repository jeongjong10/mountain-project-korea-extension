const CONTRIBUTION_FAQ_UI_TEXT: Readonly<Record<string, string>> = {
  'Adding New Areas & Routes': '새 지역과 루트 추가',
  'Thanks for sharing your first area!': '첫 지역을 공유해 주셔서 감사합니다!',
  'Here are some FAQs to help get you started.':
    '시작에 도움이 되는 자주 묻는 질문을 확인해 보세요.',
  'How are areas and route organized?': '지역과 루트는 어떻게 구성되나요?',
  'Areas are arranged in a hierarchy from states (and countries) down to small crags and individual boulders. States can have any number and levels of sub-areas. Complicated areas will have more sub-areas than straightforward ones. Sub-areas can contain either more sub-areas OR routes, but not both.':
    '지역은 주(또는 국가)부터 작은 암장과 개별 볼더까지 계층 구조로 구성됩니다. 주에는 여러 단계의 하위 지역을 얼마든지 둘 수 있습니다. 복잡한 지역은 단순한 지역보다 하위 지역이 더 많을 수 있습니다. 하위 지역에는 다른 하위 지역 또는 루트 중 하나만 포함할 수 있으며, 둘을 함께 포함할 수는 없습니다.',
  'Do I need to have climbed a route before adding it?': '루트를 추가하기 전에 직접 등반해야 하나요?',
  'Usually you should have climbed a route before adding it. You will be able to describe it much better and more accurately after climbing it. There might rarely be times where you can accurately enter a route without climbing it (e.g., a sport route right next to one you climbed with nearly identical features and you were able to watch someone else and learn some beta from them).':
    '일반적으로 루트를 추가하기 전에 직접 등반해야 합니다. 등반한 뒤에야 훨씬 자세하고 정확하게 설명할 수 있습니다. 직접 등반하지 않고도 정확히 입력할 수 있는 경우가 드물게 있을 수 있습니다. 예를 들어, 내가 등반한 루트 바로 옆에 특성이 거의 같은 스포츠 루트가 있고 다른 사람의 등반을 보며 베타를 충분히 파악한 경우입니다.',
  'Should I enter projects or potential routes?': '프로젝트나 잠재적인 루트를 등록해도 되나요?',
  "No, please only enter complete routes that you've climbed and can accurately describe.":
    '아니요. 직접 등반했고 정확하게 설명할 수 있는 완성된 루트만 등록해 주세요.',
  "Should I enter all the areas and routes in my guidebook to 'build out' a crag?":
    '암장 정보를 채우기 위해 가이드북의 모든 지역과 루트를 등록해도 되나요?',
  "No. While certain factual data is not copyrighted, if you haven't actually climbed the routes, you will not be able to describe them accurately. Leave them for someone else to enter.":
    '아니요. 일부 사실 정보에는 저작권이 적용되지 않지만, 직접 등반하지 않은 루트는 정확하게 설명할 수 없습니다. 해당 루트를 잘 아는 다른 사람이 등록할 수 있도록 남겨 두세요.',
  'How do I add an area?': '지역은 어떻게 추가하나요?',
  'First, find the': '먼저 이 지역을 포함하는',
  parent: '상위',
  "area that contains this area. From that page, click 'Add To Page' on the top-right of the page and add your new area. Note you may need to first create intermediate sub-areas if they don't exist yet. For example, if you have a small new crag in Colorado, and it doesn't belong in any existing sub-area of Colorado, you may first need to create a region that contains your new crag and other nearby new crags.":
    "지역을 찾으세요. 해당 페이지 오른쪽 위의 '페이지에 추가'를 눌러 새 지역을 추가합니다. 필요한 중간 하위 지역이 아직 없다면 먼저 만들어야 할 수 있습니다. 예를 들어 콜로라도에 작은 새 암장이 있지만 기존 하위 지역 어디에도 속하지 않는다면, 새 암장과 주변의 다른 새 암장을 포함하는 지역을 먼저 만들어야 할 수 있습니다.",
  'How do I add a route?': '루트는 어떻게 추가하나요?',
  "First, make sure the appropriate sub-area exists for this route - usually a named crag. You may need to create the sub-area first. From the area page, click 'Add to Page' on the top right and add your route.":
    "먼저 이 루트에 맞는 하위 지역(보통 이름이 있는 암장)이 존재하는지 확인하세요. 하위 지역을 먼저 만들어야 할 수도 있습니다. 지역 페이지 오른쪽 위의 '페이지에 추가'를 눌러 루트를 추가합니다.",
  'What should I know about copyrighted material?': '저작권이 있는 자료에 관해 무엇을 알아야 하나요?',
  'Do not copy text or photos directly from another website, guidebook, or other publication. We want to respect copyrighted material, and we would rather hear about the experience in your own words anyway! If you know the original author or photographer, and they have given you permission to use the text or photos on Mountain Project, please have them send':
    '다른 웹사이트, 가이드북 또는 출판물의 글이나 사진을 그대로 복사하지 마세요. 저작권을 존중하며, 무엇보다 여러분이 직접 경험한 내용을 자신의 말로 전해 주기를 바랍니다. 원저자나 사진가를 알고 있고 Mountain Project에서 해당 글이나 사진을 사용할 허락을 받았다면, 권리자가',
  'Contact Us': '문의하기',
  'and explicitly stat that they have granted you permission to use their material.':
    '를 통해 해당 자료의 사용을 허락했다는 사실을 명시적으로 알려 주도록 요청하세요.',
  'Are buildering and urban routes allowed?': '빌더링과 도심 루트도 허용되나요?',
  'Content related to buildering or urban climbing will not be approved without clear proof or indication that climbing is an allowed activity by the property owner or land manager.':
    '소유주나 토지 관리자가 등반을 허용한다는 명확한 증거나 표시가 없으면 빌더링 또는 도심 등반 관련 콘텐츠는 승인되지 않습니다.',
};

/** Translates Mountain Project's fixed new-area/new-route FAQ component copy. */
export function translateContributionFaqUiText(value: string): string | undefined {
  return CONTRIBUTION_FAQ_UI_TEXT[value.replace(/\s+/g, ' ').trim()];
}
