import { AreaRoutePageFinish } from '@/ui/area-route-page-finish';

it('keeps native chart nodes and handlers while adding reversible keyboard access', () => {
  document.head.innerHTML = '';
  document.body.innerHTML = `<main id="climb-area-page">
    <div id="rating-chart"><div style="width:457px"><svg width="457" height="100"><rect width="457" height="100" /></svg></div></div>
    <div id="route-chart" role="img" aria-label="Native chart" tabindex="-1"></div>
  </main>`;
  const original = document.body.innerHTML;
  const chart = document.querySelector<HTMLElement>('#rating-chart')!;
  const svg = chart.querySelector('svg');
  const select = vi.fn();
  svg!.addEventListener('click', select);
  const finish = new AreaRoutePageFinish();
  finish.mount();
  finish.mount();
  expect(chart.parentElement?.tabIndex).toBe(0);
  expect(chart.parentElement?.getAttribute('aria-label')).toBe('난이도별 통계');
  expect(chart.hasAttribute('tabindex')).toBe(false);
  expect(chart.querySelector('svg')).toBe(svg);
  svg!.dispatchEvent(new MouseEvent('click'));
  expect(select).toHaveBeenCalledOnce();
  expect(document.querySelector('#route-chart')?.getAttribute('aria-label')).toBe('Native chart');
  expect(document.querySelector('#route-chart')?.getAttribute('tabindex')).toBe('-1');
  expect(document.querySelectorAll('[data-mpkr-area-route-finish]')).toHaveLength(1);
  finish.destroy();
  expect(document.body.innerHTML).toBe(original);
  expect(document.querySelector('[data-mpkr-area-route-finish]')).toBeNull();
  finish.mount();
  expect(chart.parentElement?.tabIndex).toBe(0);
  finish.destroy();
  expect(document.body.innerHTML).toBe(original);
});
