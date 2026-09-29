import type { TranslationProvider, TranslationRequest } from '@/core/translation-provider';
import { TranslationLedger } from '@/core/translation-record';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { detectPage } from '@/sites/mountain-project/contract/routes';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { resolveMountainProjectPageCapabilities } from '@/sites/mountain-project/dom/page-capabilities';
import {
  PARTNER_FINDER_RESULTS_FIXTURE,
  PARTNER_FINDER_REMAINING_UI_FIXTURE,
  PARTNER_FINDER_SEARCH_FIXTURE,
  dynamicPartnerRow,
} from '../fixtures/mountain-project/partner-finder';

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 30));
}

class RecordingProvider implements TranslationProvider {
  readonly id = 'partner-finder-test';
  readonly requests: TranslationRequest[] = [];

  async availability(): Promise<'available'> {
    return 'available';
  }

  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return request.text
      .replace('Weekday mornings.', '평일 오전.')
      .replace('Weekend afternoons.', '주말 오후.')
      .replace('Trail running and coffee.', '트레일 러닝과 커피.')
      .replace('Looking for a careful partner near Testville.', 'Testville 근처에서 신중한 파트너를 찾습니다.')
      .replace('Tuesday evenings.', '화요일 저녁.')
      .replace('Photography.', '사진 촬영.')
      .replace('Safe belays and clear plans.', '안전한 빌레이와 명확한 계획을 선호합니다.');
  }
}

describe('Partner Finder localization', () => {
  const originalUrl = window.location.href;
  const localizers: DirectPageLocalizer[] = [];
  const controllers: PageTranslationController[] = [];

  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
  });

  afterEach(() => {
    controllers.splice(0).forEach((controller) => controller.destroy());
    localizers.splice(0).forEach((localizer) => localizer.restore());
    document.body.innerHTML = '';
    window.location.href = originalUrl;
  });

  it.each([
    '/partner-finder',
    '/partner-finder/',
    '/partner-finder/results',
    '/partner-finder/results?min-age=-&max-age=-&location=&distance=25',
    '/partner-finder/results?page=2&location=Testville',
  ])('detects the complete route family for %s', (path) => {
    expect(detectPage(new URL(`https://www.mountainproject.com${path}`)))
      .toBe('partner-finder');
  });

  it('translates search UI while preserving the complete form contract and handlers', () => {
    window.location.href = 'https://www.mountainproject.com/partner-finder';
    document.body.innerHTML = PARTNER_FINDER_SEARCH_FIXTURE;
    const form = document.querySelector<HTMLFormElement>('form')!;
    const hidden = form.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    const before = document.body.innerHTML;
    const entries = [...new FormData(form).entries()];
    const fields = [...form.elements].map((field) => ({
      name: (field as HTMLInputElement).name,
      value: (field as HTMLInputElement).value,
    }));
    const button = form.querySelector<HTMLButtonElement>('button')!;
    const listener = vi.fn();
    button.addEventListener('click', listener);
    const localizer = new DirectPageLocalizer();
    localizers.push(localizer);

    localizer.apply();
    localizer.apply();

    expect(document.querySelector('h1')?.textContent).toBe('등반 파트너 찾기');
    expect(document.querySelector('h2')?.textContent).toBe('등반 파트너 검색');
    expect(form.textContent).toContain('다음 난이도 이상을 등반하는 파트너 찾기');
    expect(form.textContent).toContain('선등');
    expect(form.querySelector<HTMLInputElement>('[name="location"]')?.placeholder).toBe('우편번호');
    expect(form.getAttribute('action')).toBe('/partner-finder/results');
    expect(form.getAttribute('method')).toBe('get');
    expect(hidden.name).toBe('_token');
    expect(hidden.value).toBe('');
    expect([...new FormData(form).entries()]).toEqual(entries);
    expect([...form.elements].map((field) => ({
      name: (field as HTMLInputElement).name,
      value: (field as HTMLInputElement).value,
    }))).toEqual(fields);
    button.click();
    expect(listener).toHaveBeenCalledOnce();

    localizer.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('separates result chrome from authored preferences and preserves user data', async () => {
    window.location.href = 'https://www.mountainproject.com/partner-finder/results?min-age=-&max-age=-&location=&distance=25';
    document.body.innerHTML = PARTNER_FINDER_RESULTS_FIXTURE;
    const profile = document.querySelector<HTMLAnchorElement>('#partner-row a[href*="/user/"]')!;
    const route = document.querySelector<HTMLAnchorElement>('#partner-row a[href*="/route/"]')!;
    const originalProfileHref = profile.getAttribute('href');
    const originalRouteHref = route.getAttribute('href');
    const provider = new RecordingProvider();
    const adapter = new MountainProjectPageAdapter();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      adapter,
      new OriginalPreservingRenderer(),
    );
    const localizer = new DirectPageLocalizer();
    controllers.push(controller);
    localizers.push(localizer);

    expect(resolveMountainProjectPageCapabilities(new URL(window.location.href)).authoredTranslation)
      .toBe(true);
    await controller.start();
    localizer.apply();

    expect([...document.querySelectorAll('th')].map((node) => node.textContent)).toEqual([
      '이름', '기본 정보', '등반 정보', '가능 시간', '기타 관심사', '추가 소개',
    ]);
    expect(document.querySelector('.page-title')?.textContent).toContain('가능한 파트너 1명:');
    expect(document.querySelector('.page-title')?.textContent).toContain('Testville에서 25마일 이내 거주');
    expect(profile.textContent).toBe('Fixture Climber');
    expect(profile.getAttribute('href')).toBe(originalProfileHref);
    expect(route.textContent).toBe('Granite Test Route V2');
    expect(route.getAttribute('href')).toBe(originalRouteHref);
    expect(document.querySelector('#partner-row td:nth-child(2)')?.textContent)
      .toContain('Testville, ZZ');
    expect(document.querySelector('#partner-row td:nth-child(2)')?.textContent)
      .toContain('38');
    expect(document.querySelector('#partner-row td:nth-child(2)')?.textContent)
      .toContain('여성, 38');
    expect(document.querySelector('#partner-row td:nth-child(3)')?.textContent)
      .toContain('트래드: 선등 5.10a, 후등 5.10c');
    expect(document.querySelector('#partner-row td:first-child')?.textContent)
      .toContain('Sep 29, 2026');
    expect(document.querySelector('#partner-row td:first-child')?.textContent)
      .toContain('마지막 방문:');
    expect(provider.requests).toHaveLength(3);
    expect(provider.requests.every((request) => !request.text.includes('_token'))).toBe(true);
    const requestedText = provider.requests.map((request) => request.text).join('\n');
    expect(requestedText).not.toContain('Fixture Climber');
    expect(requestedText).not.toContain('Testville, ZZ');
    expect(requestedText).not.toContain('Sep 29, 2026');
    expect(requestedText).not.toContain('Female, 38');
    expect(requestedText).not.toContain('Trad: leads 5.10a');
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(3);
    expect(document.body.textContent).toContain('평일 오전.');
    expect(document.body.textContent).toContain('Testville 근처에서 신중한 파트너를 찾습니다.');
    expect(document.querySelectorAll('#partner-row td:nth-child(4) .mpkr-machine-translation br'))
      .toHaveLength(1);
    const translatedRoute = document.querySelector<HTMLAnchorElement>(
      '#partner-row td:nth-child(6) .mpkr-machine-translation a[href*="/route/"]',
    );
    expect(translatedRoute?.textContent).toBe('Granite Test Route V2');
    expect(translatedRoute?.getAttribute('href')).toBe(originalRouteHref);
    expect(document.querySelectorAll('.mpkr-original-toggle')).toHaveLength(3);
    expect(document.querySelectorAll('.mpkr-retranslate')).toHaveLength(3);

    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(document.body.textContent).toContain('Weekday mornings.');
    const requestCount = provider.requests.length;
    document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!.click();
    await settle();
    expect(provider.requests.length).toBe(requestCount + 1);
  });

  it.each(['500', '12,345'])(
    'localizes the remaining result-card UI while preserving the dynamic count and user data (%s)',
    (count) => {
      window.location.href = 'https://www.mountainproject.com/partner-finder/results';
      document.body.innerHTML = PARTNER_FINDER_REMAINING_UI_FIXTURE.replace('500', count);
      const localizer = new DirectPageLocalizer();
      localizers.push(localizer);
      const resultHeading = document.querySelector<HTMLElement>('#partner-result-count')!;
      const countChild = resultHeading.querySelector<HTMLElement>('.result-count')!;
      const headingAttributes = [...resultHeading.attributes].map(({ name, value }) => [name, value]);
      const countAttributes = [...countChild.attributes].map(({ name, value }) => [name, value]);
      const profileLinks = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/user/"]')]
        .map((link) => ({ text: link.textContent, href: link.getAttribute('href') }));
      const routeLinks = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/route/"]')]
        .map((link) => ({ text: link.textContent, href: link.getAttribute('href') }));

      localizer.apply();

      expect(resultHeading.textContent).toBe(`가능한 파트너 ${count}명:`);
      expect(resultHeading.querySelector('.result-count')).toBe(countChild);
      expect(countChild.textContent).toBe(count);
      expect([...resultHeading.attributes].map(({ name, value }) => [name, value]))
        .toEqual(headingAttributes);
      expect([...countChild.attributes].map(({ name, value }) => [name, value]))
        .toEqual(countAttributes);
      expect(document.querySelector('.authored-result-phrase')?.textContent)
        .toBe('Found 77 possible partners who:');
      expect(document.querySelector('#live-partner-row td:nth-child(2)')?.textContent)
        .toBe('Sport여성, 알 수 없음트래드, 스포츠, 톱로프, 클라이밍 짐');
      expect(document.querySelector('#male-partner-row td:nth-child(2)')?.textContent)
        .toBe('Trad남성, 알 수 없음클라이밍 짐');
      expect([...document.querySelectorAll('#live-partner-row strong')].map((node) => node.textContent))
        .toEqual(['가능 시간:', '기타 관심사:']);
      expect(document.querySelector('#live-partner-row td:nth-child(4)')?.textContent)
        .toContain('Trad, Sport, TR, Gym are all mentioned in this free-form preference.');
      expect(document.querySelector('#live-partner-row td:nth-child(5)')?.textContent)
        .toContain('Female, unknown is preserved when it is authored text.');
      expect([...document.querySelectorAll<HTMLAnchorElement>('a[href*="/user/"]')]
        .map((link) => ({ text: link.textContent, href: link.getAttribute('href') })))
        .toEqual(profileLinks);
      expect([...document.querySelectorAll<HTMLAnchorElement>('a[href*="/route/"]')]
        .map((link) => ({ text: link.textContent, href: link.getAttribute('href') })))
        .toEqual(routeLinks);
    },
  );

  it('collects authored cells after result chrome has already been localized', async () => {
    window.location.href = 'https://www.mountainproject.com/partner-finder/results?page=2';
    document.body.innerHTML = PARTNER_FINDER_RESULTS_FIXTURE;
    const localizer = new DirectPageLocalizer();
    const provider = new RecordingProvider();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
    );
    localizers.push(localizer);
    controllers.push(controller);

    localizer.apply();
    await controller.start();

    expect(provider.requests).toHaveLength(3);
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(3);
  });

  it('processes dynamically replaced result rows once without translating its own output', async () => {
    window.location.href = 'https://www.mountainproject.com/partner-finder/results?min-age=-&max-age=-&location=&distance=25';
    document.body.innerHTML = PARTNER_FINDER_RESULTS_FIXTURE;
    const provider = new RecordingProvider();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
    );
    controllers.push(controller);
    await controller.start();
    provider.requests.length = 0;

    const table = document.createElement('table');
    table.innerHTML = `<tbody>${dynamicPartnerRow()}</tbody>`;
    document.querySelector('tbody')!.append(table.querySelector('tr')!);
    await settle();
    expect(provider.requests).toHaveLength(3);
    expect(document.body.textContent).toContain('화요일 저녁.');
    const count = provider.requests.length;
    await settle();
    expect(provider.requests).toHaveLength(count);
  });
});
