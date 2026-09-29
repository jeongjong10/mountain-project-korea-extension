import { createContractDiagnosticReporter } from '@/sites/mountain-project/contract/diagnostics';
import type { ContractDiagnostic } from '@/sites/mountain-project/contract/schema';
import { RouteStatsEmbedLayout } from '@/ui/route-stats-embed/layout';
import { SouthKoreaMapEmbed } from '@/ui/south-korea-map-embed';

describe('Mountain Project contract diagnostics', () => {
  it('sanitizes a copy of the page URL and deduplicates using the sanitized page', () => {
    const warn = vi.fn();
    const report = createContractDiagnosticReporter({ warn });
    const page = 'https://www.mountainproject.com/route/106232568/chouinard-b';
    const originalPage = page.replace('https://', 'https://SECRET_USER:SECRET_PASSWORD@')
      + '?token=SECRET_QUERY#SECRET_FRAGMENT';
    const diagnostic: ContractDiagnostic = Object.freeze({
      component: 'route-stats-embed',
      key: 'route-page',
      reason: 'Route page root is missing.',
      page: originalPage,
      attemptedSelectors: ['#route-page'],
    });

    report(diagnostic);
    report({ ...diagnostic, page: `${page}?token=OTHER_SECRET#OTHER_FRAGMENT` });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[MPKR contract] route-stats-embed/route-page: Route page root is missing.',
      { ...diagnostic, page },
    );
    expect(warn.mock.calls[0]?.[1]).not.toBe(diagnostic);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('SECRET');
    expect(diagnostic.page).toBe(originalPage);
  });

  it.each([undefined, '', 'not a URL?token=SECRET_QUERY#SECRET_FRAGMENT',
    'https://[invalid]/route?token=SECRET_QUERY#SECRET_FRAGMENT'])
  ('omits missing or malformed page URLs safely: %s', (page) => {
    const warn = vi.fn();
    const report = createContractDiagnosticReporter({ warn });
    const details: ContractDiagnostic = {
      component: 'route-stats-embed',
      key: 'route-page',
      reason: 'Route page root is missing.',
    };
    const diagnostic = Object.freeze({ ...details, page });

    report(diagnostic);
    report(diagnostic);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[MPKR contract] route-stats-embed/route-page: Route page root is missing.',
      details,
    );
    expect(warn.mock.calls[0]?.[1]).not.toHaveProperty('page');
    expect(JSON.stringify(warn.mock.calls)).not.toContain('SECRET');
    expect(diagnostic.page).toBe(page);
  });

  it('emits one structured warning per component and page across observer retries', () => {
    const warn = vi.fn();
    const report = createContractDiagnosticReporter({ warn } as Pick<Console, 'warn'>);
    const first: ContractDiagnostic = {
      component: 'route-stats-embed',
      key: 'route-page',
      reason: 'Route page root is missing.',
      page: 'https://www.mountainproject.com/route/106232568/chouinard-b',
      attemptedSelectors: ['#route-page'],
    };

    report(first);
    report({
      ...first,
      key: 'you-and-route',
      reason: 'You & This Route landmark is missing.',
      attemptedSelectors: ['#you-and-route'],
    });
    report(first);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[MPKR contract] route-stats-embed/route-page: Route page root is missing.',
      first,
    );
  });

  it('keeps independent component and page failures independently actionable', () => {
    const warn = vi.fn();
    const report = createContractDiagnosticReporter({ warn } as Pick<Console, 'warn'>);

    report({
      component: 'south-korea-map',
      key: 'main-content',
      reason: 'Main content is missing.',
      page: 'https://www.mountainproject.com/area/106225629/south-korea',
    });
    report({
      component: 'south-korea-map-frame',
      key: 'frame-landmarks',
      reason: 'map landmark missing.',
      page: 'https://www.mountainproject.com/map/106225629/south-korea',
    });
    report({
      component: 'south-korea-map',
      key: 'main-content',
      reason: 'Main content is missing.',
      page: 'https://www.mountainproject.com/area/119631691/jeju-island',
    });

    expect(warn).toHaveBeenCalledTimes(3);
    for (const [, diagnostic] of warn.mock.calls) {
      expect(diagnostic).toEqual(expect.objectContaining({
        component: expect.any(String),
        key: expect.any(String),
        reason: expect.any(String),
        page: expect.stringMatching(/^https:\/\//),
      }));
    }
  });

  it('deduplicates retries from the map and stats mounts used by the content bootstrap', async () => {
    const warn = vi.fn();
    const report = createContractDiagnosticReporter({ warn } as Pick<Console, 'warn'>);
    const map = new SouthKoreaMapEmbed(report);
    const stats = new RouteStatsEmbedLayout(report);
    const areaUrl = new URL(
      'https://www.mountainproject.com/area/106225629/south-korea',
    );
    const routeUrl = new URL(
      'https://www.mountainproject.com/route/106232568/chouinard-b',
    );
    document.body.innerHTML = '<div id="climb-area-page"></div>';

    expect(map.mount(document, areaUrl)).toBe(false);
    expect(map.mount(document, areaUrl)).toBe(false);
    document.body.innerHTML = '';
    expect(stats.mount(document, routeUrl)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.map(([, diagnostic]) => diagnostic.component)).toEqual([
      'south-korea-map',
      'route-stats-embed',
    ]);

    map.destroy();
    stats.destroy();
  });
});
