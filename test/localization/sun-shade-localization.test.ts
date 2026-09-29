import {
  AREA_SUN_SHADE_FIXTURE,
  ROUTE_SUN_SHADE_FIXTURE,
} from '../fixtures/mountain-project/sun-shade';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('#sun-shade localization', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('localizes fixed Area UI while preserving exposure data, authored copy, and graphics', () => {
    document.body.innerHTML = AREA_SUN_SHADE_FIXTURE;
    const map = document.querySelector<HTMLElement>('#sunAngleMap')!;
    const canvas = document.querySelector<HTMLCanvasElement>('#sun-canvas')!;
    const svg = document.querySelector<SVGSVGElement>('#sun-svg')!;
    const path = document.querySelector<SVGPathElement>('#sun-path')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(document.querySelector('#sun-shade h2')?.childNodes[0]?.textContent?.trim())
      .toBe('햇빛과 그늘');
    expect(document.querySelector('#sun-map-link')?.childNodes[2]?.textContent?.trim())
      .toBe('일조 각도 자세히:');
    expect(document.querySelector('#sun-map-link')?.getAttribute('title'))
      .toBe('일조 각도 자세히');
    expect(document.querySelector('#sun-icon')?.getAttribute('alt')).toBe('햇빛과 그늘');
    expect(document.querySelectorAll('#sun-shade .mb-half')[0]?.childNodes[0]?.textContent?.trim())
      .toBe('루트의 주 향:');
    expect(document.querySelectorAll('#sun-shade .mb-half')[1]?.childNodes[0]?.textContent?.trim())
      .toBe('대략적인 일조 시간');
    expect(document.querySelector('#sun-shade .text-muted')?.textContent).toBe('성수기 기준');
    expect(document.querySelector('#sun-details strong')?.textContent).toBe('상세 정보:');
    expect(document.querySelector('#sun-toggle')?.textContent).toBe('일조 정보 보기');
    expect(document.querySelector('#sun-toggle')?.getAttribute('title')).toBe('일조 정보 보기');
    expect(document.querySelector('#sun-toggle')?.getAttribute('aria-label')).toBe('일조 정보 보기');
    expect(document.querySelector('#sun-loading')?.textContent)
      .toBe('일조·그늘 정보를 불러오는 중...');
    expect(document.querySelector('#sun-chart')?.getAttribute('aria-label'))
      .toBe('6am부터 9am까지 햇빛');
    expect(document.querySelector('#sun-legend')?.textContent).toBe('햇빛');

    expect(document.querySelector('#exposure-value')?.textContent).toBe('North · Southwest');
    expect(document.querySelector('#sun-time-value')?.textContent).toBe('6am to 9am');
    expect(document.querySelector('#sun-details')?.textContent)
      .toContain('Fictional diagram: the orange panel is shaded after 9 AM.');
    expect(document.querySelector('#sunAngleMap')).toBe(map);
    expect(document.querySelector('#sun-canvas')).toBe(canvas);
    expect(document.querySelector('#sun-svg')).toBe(svg);
    expect(document.querySelector('#sun-path')).toBe(path);
    expect(map.dataset.bearing).toBe('0.00');
    expect(map.getAttribute('style')).toContain('height: 130px');
    expect(canvas.width).toBe(460);
    expect(canvas.height).toBe(130);
    expect(svg.getAttribute('viewBox')).toBe('0 0 460 130');
    expect(path.getAttribute('d')).toBe('M0 65 L460 65');

    localizer.restore();
    expect(document.querySelector('#sun-shade h2')?.childNodes[0]?.textContent?.trim())
      .toBe('Sun & Shade');
    expect(document.querySelector('#sun-map-link')?.getAttribute('title')).toBe('Sun Angle Details');
    expect(document.querySelector('#sun-legend')?.textContent).toBe('Sunny');
    expect(document.querySelector('#exposure-value')?.textContent).toBe('North · Southwest');
  });

  it('localizes Route empty/toggle UI without translating authored or out-of-component text', () => {
    document.body.innerHTML = ROUTE_SUN_SHADE_FIXTURE;
    const unknownLink = document.querySelector<HTMLAnchorElement>('#unknown-sun-details')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);
    localizer.apply(document);

    expect(document.querySelector('#sun-shade h3')?.textContent).toBe('햇빛과 그늘');
    expect(unknownLink.textContent?.trim()).toBe('일조 정보가 없습니다. 알고 계신가요?');
    expect(document.querySelector('#route-sun-toggle')?.textContent?.trim()).toBe('일조 정보 숨기기');
    expect(document.querySelector('#route-sun-toggle')?.getAttribute('aria-label'))
      .toBe('일조 정보 숨기기');
    expect(document.querySelector('#sun-empty')?.textContent).toBe('일조·그늘 정보가 없습니다.');
    expect(document.querySelector('#route-authored-copy')?.textContent)
      .toBe('The imaginary practice panel has a shaded blue section.');
    expect(document.querySelector('#outside-sun-label')?.textContent).toBe('Sun & Shade');
    expect(unknownLink.getAttribute('href')).toBe('#');
    expect(unknownLink.dataset.toggle).toBe('modal');

    localizer.restore();
    expect(document.querySelector('#sun-shade h3')?.textContent).toBe('Sun & Shade');
    expect(unknownLink.textContent?.trim()).toBe('Sun Details Unknown. Know About It?');
    expect(document.querySelector('#route-sun-toggle')?.getAttribute('aria-label'))
      .toBe('Hide Sun Details');
  });

  it('localizes dynamic insertion and re-render once, then restores the latest source DOM', async () => {
    document.body.innerHTML = '<div id="climb-area-page"></div>';
    const translatedSources: string[] = [];
    const localizer = new DirectPageLocalizer((record) => {
      translatedSources.push(record.source);
    });
    localizer.apply(document);

    const template = document.createElement('template');
    template.innerHTML = AREA_SUN_SHADE_FIXTURE;
    const sunShade = template.content.querySelector<HTMLElement>('#sun-shade')!;
    document.querySelector('#climb-area-page')!.append(sunShade);
    await flushMutations();
    await flushMutations();

    expect(document.querySelector('#sun-shade h2')?.childNodes[0]?.textContent?.trim())
      .toBe('햇빛과 그늘');
    const countAfterInsertion = translatedSources.length;
    await flushMutations();
    expect(translatedSources).toHaveLength(countAfterInsertion);
    expect(translatedSources).not.toContain('햇빛과 그늘');

    const toggle = document.querySelector<HTMLButtonElement>('#sun-toggle')!;
    toggle.firstChild!.nodeValue = 'Hide Sun Details';
    toggle.setAttribute('aria-label', 'Hide Sun Details');
    await flushMutations();
    expect(toggle.textContent).toBe('일조 정보 숨기기');
    expect(toggle.getAttribute('aria-label')).toBe('일조 정보 숨기기');

    localizer.restore();
    expect(document.querySelector('#sun-shade h2')?.childNodes[0]?.textContent?.trim())
      .toBe('Sun & Shade');
    expect(toggle.textContent).toBe('Hide Sun Details');
    expect(toggle.getAttribute('aria-label')).toBe('Hide Sun Details');
    expect(document.querySelector('#sun-map-link')?.getAttribute('title')).toBe('Sun Angle Details');
    expect(document.querySelector('#sun-details strong')?.textContent).toBe('Details:');
    expect(document.querySelector('#sun-legend')?.textContent).toBe('Sunny');
  });
});
