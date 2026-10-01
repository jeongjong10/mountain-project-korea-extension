import { FirstRunOnboarding } from '@/ui/first-run-onboarding';

describe('first-run onboarding spotlight', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('repositions its viewport shades on resize and removes all state on hide', async () => {
    const label = document.createElement('label');
    document.body.append(label);
    let rect = new DOMRect(700, 20, 180, 38);
    vi.spyOn(label, 'getBoundingClientRect').mockImplementation(() => rect);
    const onboarding = new FirstRunOnboarding();

    onboarding.show(label);
    const shades = document.querySelectorAll<HTMLElement>('.mpkr-first-run-shade');
    expect(shades[0]!.style.height).toBe('13px');
    expect(shades[1]!.style.left).toBe('887px');
    expect(label.classList.contains('mpkr-first-run-target')).toBe(true);

    rect = new DOMRect(500, 40, 160, 38);
    window.dispatchEvent(new Event('resize'));
    await new Promise(requestAnimationFrame);
    expect(shades[0]!.style.height).toBe('33px');
    expect(shades[1]!.style.left).toBe('667px');

    onboarding.hide();
    expect(document.querySelector('.mpkr-first-run-overlay')).toBeNull();
    expect(label.classList.contains('mpkr-first-run-target')).toBe(false);
  });

  it('keeps the full prompt inside the viewport gutter near the right edge', () => {
    const label = document.createElement('label');
    document.body.append(label);
    vi.spyOn(label, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(window.innerWidth - 80, 20, 70, 38),
    );
    const elementRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    elementRect.mockImplementation(function getRect(this: HTMLElement) {
      return (this as HTMLElement).classList.contains('mpkr-first-run-prompt')
        ? new DOMRect(0, 0, 280, 38)
        : new DOMRect();
    });
    const onboarding = new FirstRunOnboarding();

    onboarding.show(label);

    const prompt = document.querySelector<HTMLElement>('.mpkr-first-run-prompt')!;
    expect(prompt.style.left).toBe(`${window.innerWidth - 12 - 140}px`);
    onboarding.destroy();
    elementRect.mockRestore();
  });
});
