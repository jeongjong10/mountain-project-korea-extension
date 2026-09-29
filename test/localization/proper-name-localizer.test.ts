import { ProperNameLocalizer } from '@/localization/proper-name-localizer';

describe('ProperNameLocalizer', () => {
  it('uses curated bilingual names and restores the same nodes', () => {
    document.body.innerHTML = `
      <h1>South Korea <span>Climbing</span></h1>
      <a href="/area/119456750/seoulgyeonggi-do-northwest-korea">Seoul/Gyeonggi-do (Northwest Korea)</a>
      <a id="route" href="/route/106232568/chouinard-b">Chouinard B</a>
    `;
    const heading = document.querySelector('h1')!;
    const area = document.querySelector<HTMLAnchorElement>('a[href*="/area/"]')!;
    const localizer = new ProperNameLocalizer();

    localizer.apply();

    expect(document.querySelector('h1')).toBe(heading);
    expect(heading.textContent).toContain('대한민국 (South Korea)');
    expect(area.textContent).toBe('서울/경기도(한국 북서부) (Seoul/Gyeonggi-do (Northwest Korea))');
    expect(document.querySelector('#route')?.textContent).toBe('Chouinard B');

    localizer.restore();
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe('South Korea Climbing');
    expect(area.textContent).toBe('Seoul/Gyeonggi-do (Northwest Korea)');
  });
});
