import { TranslationLedger } from '@/core/translation-record';
import type { TranslationProvider } from '@/core/translation-provider';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';

const originalUrl = window.location.href;
let controller: PageTranslationController | undefined;
let localizer: DirectPageLocalizer | undefined;

afterEach(() => {
  controller?.destroy();
  localizer?.restore();
  document.body.innerHTML = '';
  window.location.href = originalUrl;
});

describe('About page localization', () => {
  it('translates prose and labels while preserving contributor data, links, formatting and restoration', async () => {
    window.location.href = 'https://www.mountainproject.com/about';
    document.body.innerHTML = `
      <div id="about-page" class="climb">
        <div class="row page-title"><div class="col-xs-12"><h1>Beyond the Guidebook: The Definitive Climbing Resource</h1></div></div>
        <div class="row">
          <div class="col-xs-12 col-md-8"><div class="bg-gray-background p-1">
            <h2>Mountain Project: A Free, Crowd-Sourced Guide to Climbing the World</h2>
            <p>Climbers share their knowledge.
Keep this line.<br><strong>Explore safely.</strong> Read <a href="https://www.onxmaps.com/">onX Maps</a>.</p>
            <h2>The Backstory</h2><p>Friends created a shared climbing guide.</p>
          </div></div>
          <div class="col-md-4"><div class="stats-box">
            <div><a href="/directory/users">More</a></div><h3>Top contributors</h3>
            <div class="top-users"><div class="top-user"><strong>#1</strong><a href="/user/123/more">More</a><span>12,345</span></div></div>
            <h3>Site stats</h3><div><strong>Routes</strong><span>999,888</span></div><div><strong>Forum posts</strong><span>321</span></div>
          </div></div>
        </div>
        <table><thead><tr><th>Regional Admins: <span>Mountain Project is run by volunteers. These are the heroes that manage the content.</span></th></tr></thead>
          <tbody><tr><td><a href="/user/456/forum">Forum</a></td><td>New England</td></tr></tbody>
        </table>
      </div>`;
    const original = document.body.innerHTML;
    const stats = document.querySelector('.top-users')!.innerHTML;
    const admins = document.querySelector('tbody')!.innerHTML;
    const link = document.querySelector<HTMLAnchorElement>('.col-md-8 a')!;
    const handler = vi.fn();
    link.addEventListener('click', (event) => { event.preventDefault(); handler(); });
    const engine: TranslationProvider = {
      id: 'about-test',
      availability: async () => 'available',
      translate: vi.fn(async ({ text }) => `한국어: ${text}`),
    };
    localizer = new DirectPageLocalizer();
    localizer.apply();
    controller = new PageTranslationController(
      engine, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
    );
    await controller.start();

    expect(document.querySelector('h1')?.textContent).toBe('가이드북을 넘어: 클라이밍 종합 정보');
    expect(document.querySelector('.col-md-8 p')?.textContent).toContain('한국어: Climbers share their knowledge.\nKeep this line.');
    expect(document.querySelector('.col-md-8 br')).not.toBeNull();
    expect(document.querySelector('.col-md-8 strong')?.textContent).toContain('한국어: Explore safely.');
    expect(document.querySelector('.stats-box h3')?.textContent).toBe('주요 기여자');
    expect(document.querySelector('.stats-box')?.textContent).toContain('999,888');
    expect(document.querySelector('.top-users')?.innerHTML).toBe(stats);
    expect(document.querySelector('tbody')?.innerHTML).toBe(admins);
    expect(document.querySelector('th')?.textContent).toContain('지역 관리자:');
    expect(document.querySelector('.col-md-8 a')).toBe(link);
    expect(link.href).toBe('https://www.onxmaps.com/');
    link.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(vi.mocked(engine.translate).mock.calls.some(([request]) => request.text.includes('Friends created'))).toBe(true);

    controller.destroy();
    localizer.restore();
    expect(document.body.innerHTML).toBe(original);
  });
});
