import { MapSunControlsLocalizer } from '@/localization/map-sun-controls-localizer';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('MapSunControlsLocalizer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sun-controls" data-map-state="owned-by-site">
        <h2><label><input id="toggle-sun" type="checkbox" data-action="sun">
          Sun Angles <span id="month-name">on September 22</span>
        </label></h2>
        <div id="times" title="Toggle Sun Angles">
          Sunrise: <strong><span id="sunrise">06:18</span></strong>
          · Sunset: <strong><span id="sunset">18:28</span></strong>
          <div><span id="timezone">GMT+9</span> Time Zone</div>
        </div>
        <div id="months"><span>Jan</span><span>Feb</span><span>Dec</span></div>
        <div id="sun-angle-slider" data-day="265"></div>
      </div>
    `;
  });

  it('translates fixed chrome without checking the sun toggle or dispatching events', () => {
    const controls = document.querySelector<HTMLElement>('#sun-controls')!;
    const checkbox = document.querySelector<HTMLInputElement>('#toggle-sun')!;
    const slider = document.querySelector<HTMLElement>('#sun-angle-slider')!;
    const sunrise = document.querySelector<HTMLElement>('#sunrise')!;
    const events: string[] = [];
    checkbox.addEventListener('input', () => events.push('input'));
    checkbox.addEventListener('change', () => events.push('change'));
    const localizer = new MapSunControlsLocalizer();

    localizer.connect(document);
    localizer.connect(document);

    expect(checkbox.checked).toBe(false);
    expect(events).toEqual([]);
    expect(document.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('태양 각도 날짜: September 22');
    expect(document.querySelector('#times')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('일출: 06:18 · 일몰: 18:28 GMT+9 시간대');
    expect(document.querySelector('#times')?.getAttribute('title')).toBe('태양 각도 표시 전환');
    expect(Array.from(document.querySelectorAll('#months span')).map((item) => item.textContent))
      .toEqual(['1월', '2월', '12월']);
    expect(document.querySelector('#sunrise')).toBe(sunrise);
    expect(document.querySelector('#sun-angle-slider')).toBe(slider);
    expect(slider.dataset.day).toBe('265');
    expect(controls.dataset.mapState).toBe('owned-by-site');

    localizer.disconnect();
    expect(document.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Sun Angles on September 22');
    expect(document.querySelector('#times')?.getAttribute('title')).toBe('Toggle Sun Angles');
    expect(document.querySelector('#sunrise')?.textContent).toBe('06:18');
  });

  it('supports rerenders without re-enabling after a user manually unchecks it', async () => {
    const localizer = new MapSunControlsLocalizer();
    const checkbox = document.querySelector<HTMLInputElement>('#toggle-sun')!;
    localizer.connect(document);

    checkbox.click();
    expect(checkbox.checked).toBe(true);
    checkbox.click();
    expect(checkbox.checked).toBe(false);
    document.querySelector('#sun-controls')!.innerHTML = `
      <label><input id="toggle-sun-rerendered" name="sun-overlay" type="checkbox">
        Sun Angles <span id="month-name">on October 3</span>
      </label>
      <span aria-label="Hide Sun Angles">Sunrise:</span>
      <span id="sunrise">07:01</span>
    `;
    await flushMutations();
    await flushMutations();

    const rerendered = document.querySelector<HTMLInputElement>('#toggle-sun-rerendered')!;
    expect(rerendered.checked).toBe(false);
    expect(document.querySelector('#sun-controls')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('태양 각도 날짜: October 3 일출: 07:01');
    expect(document.querySelector('[aria-label]')?.getAttribute('aria-label'))
      .toBe('태양 각도 숨기기');

    localizer.disconnect();
    expect(document.querySelector('#sun-controls')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Sun Angles on October 3 Sunrise: 07:01');
    expect(document.querySelector('[aria-label]')?.getAttribute('aria-label'))
      .toBe('Hide Sun Angles');
  });

  it.each([false, true])('preserves checked=%s across reconnects and document replacement', (checked) => {
    const localizer = new MapSunControlsLocalizer();
    const replacement = document.implementation.createHTMLDocument('Reloaded map');
    replacement.body.innerHTML = document.body.innerHTML;

    for (const currentDocument of [document, replacement]) {
      const checkbox = currentDocument.querySelector<HTMLInputElement>('#toggle-sun')!;
      checkbox.checked = checked;
      const events: string[] = [];
      checkbox.addEventListener('input', () => events.push('input'));
      checkbox.addEventListener('change', () => events.push('change'));

      localizer.connect(currentDocument);
      localizer.connect(currentDocument);
      expect(checkbox.checked).toBe(checked);
      expect(events).toEqual([]);

      // Native clicks must still reach the site's handlers.
      checkbox.click();
      expect(checkbox.checked).toBe(!checked);
      expect(events).toEqual(['input', 'change']);
      localizer.disconnect();
      localizer.connect(currentDocument);
      expect(checkbox.checked).toBe(!checked);
      expect(events).toEqual(['input', 'change']);
    }
    localizer.disconnect();
  });

  it.each([false, true])('preserves checked=%s when controls arrive after connect', async (checked) => {
    document.body.innerHTML = '';
    const localizer = new MapSunControlsLocalizer();
    localizer.connect(document);
    const controls = document.createElement('div');
    controls.id = 'sun-controls';
    controls.innerHTML = '<label><input type="checkbox"> Sun Angles</label>';
    const checkbox = controls.querySelector('input')!;
    checkbox.checked = checked;
    const events: string[] = [];
    checkbox.addEventListener('input', () => events.push('input'));
    checkbox.addEventListener('change', () => events.push('change'));
    document.body.append(controls);
    await flushMutations();

    expect(controls.textContent?.trim()).toBe('태양 각도');
    expect(checkbox.checked).toBe(checked);
    expect(events).toEqual([]);
    localizer.disconnect();
    expect(checkbox.checked).toBe(checked);
  });
});
