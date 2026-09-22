import { DirectPageLocalizer } from './direct-page-localizer';

describe('DirectPageLocalizer South Korea Area UI', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = `
      <div id="climb-area-page">
        <aside class="mp-sidebar">
          <h3>Areas in South Korea</h3>
          <span id="mixed-area-label">South Korea의 지역</span>
          <button class="dropdown-item route-type-option">Show all routes</button>
          <span id="route-type-label">Highlight</span>
        </aside>
        <aside class="climb-more">
          <h4>All Photos Within South Korea</h4>
          <a href="/featured-photos?sort=Popular">Most Popular</a>
          <p><strong>More About South Korea</strong></p>
          <a href="/books/106225629">Guidebooks (1)</a>
        </aside>
        <div class="text-section mt-3">
          <h2>Classic Climbing Routes <span class="hidden-sm-down"> at South Korea</span></h2>
          <div class="hidden-md-down mb-1">Mountain Project's determination of the classic, most popular, highest rated climbing routes in this area.</div>
        </div>
      </div>
    `;
  });

  it('translates the live sidebar structure without mixed-language labels', async () => {
    const routeTypeLabel = document.querySelector<HTMLElement>('#route-type-label')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(document.querySelector('.mp-sidebar h3')?.textContent).toBe('대한민국의 지역');
    expect(document.querySelector('#mixed-area-label')?.textContent).toBe('대한민국의 지역');
    expect(document.querySelector('.route-type-option')?.textContent).toBe('모든 루트 표시');
    expect(document.querySelector('.climb-more h4')?.textContent).toBe('대한민국의 모든 사진');
    expect(document.querySelector('.climb-more a')?.textContent).toBe('인기순');
    expect(document.querySelector('.climb-more strong')?.textContent).toBe('대한민국 추가 정보');
    expect(document.querySelector('a[href^="/books/"]')?.textContent).toBe('가이드북 (1)');
    expect(document.querySelector('.text-section h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('클래식 루트 - 대한민국');
    expect(document.querySelector('.text-section > div')?.textContent)
      .toBe('Mountain Project가 선정한 이 지역의 대표적이고 인기 있으며 높은 평가를 받은 클라이밍 루트입니다.');

    routeTypeLabel.textContent = 'Show All Routes';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(routeTypeLabel.textContent).toBe('모든 루트 표시');

    const dynamicSection = document.createElement('div');
    dynamicSection.className = 'text-section mt-3';
    dynamicSection.innerHTML = `
      <h2>Classic Climbing Routes <span class="hidden-sm-down"> at South Korea</span></h2>
      <div>Mountain Project's determination of the classic, most popular, highest rated climbing routes in this area.</div>
    `;
    document.querySelector('#climb-area-page')!.append(dynamicSection);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dynamicSection.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('클래식 루트 - 대한민국');
    expect(dynamicSection.children.item(1)?.textContent)
      .toBe('Mountain Project가 선정한 이 지역의 대표적이고 인기 있으며 높은 평가를 받은 클라이밍 루트입니다.');

    localizer.restore();
    expect(document.querySelector('.mp-sidebar h3')?.textContent).toBe('Areas in South Korea');
    expect(routeTypeLabel.textContent).toBe('Show All Routes');
    expect(document.querySelector('.text-section h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Classic Climbing Routes at South Korea');
    expect(document.querySelector('.text-section > div')?.textContent)
      .toBe("Mountain Project's determination of the classic, most popular, highest rated climbing routes in this area.");
    expect(dynamicSection.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Classic Climbing Routes at South Korea');
    expect(dynamicSection.children.item(1)?.textContent)
      .toBe("Mountain Project's determination of the classic, most popular, highest rated climbing routes in this area.");
  });
});
