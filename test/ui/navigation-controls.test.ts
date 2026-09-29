import { NavigationControls } from '@/ui/navigation-controls';
import { createApplicationRuntime } from '@/application/runtime';
import type { ExtensionSettings, SettingsRepository } from '@/core/settings';
import { SOUTH_KOREA_AREA_URL } from '@/sites/mountain-project/contract/regions/south-korea';

const header = (signedIn = true) => `<div id="header-container"><div class="header-container__user"><div id="user">${signedIn
  ? '<a href="/user/123" data-toggle="dropdown"><div class="user-img-avatar"></div></a><div class="dropdown-menu">Profile</div>'
  : '<a href="#" class="sign-in" data-toggle="modal">Sign In</a>'}</div><div id="hamburger-container">Menu</div></div></div>`;
const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

function setup(initial = true) {
  document.body.innerHTML = header();
  let emit!: (settings: ExtensionSettings) => void;
  const settings: SettingsRepository = {
    get: vi.fn(async () => ({ enabled: initial })),
    setEnabled: vi.fn(async () => {}),
    watch: vi.fn((listener) => { emit = listener; return vi.fn(); }),
  };
  const page = { enable: vi.fn(), disable: vi.fn(), destroy: vi.fn() };
  const shell = new NavigationControls();
  const runtime = createApplicationRuntime(settings, page, shell);
  return { settings, shell, runtime, page, emit: (enabled: boolean) => emit({ enabled }) };
}

describe('persistent navigation controls', () => {
  let runtime: ReturnType<typeof createApplicationRuntime> | undefined;
  afterEach(() => { runtime?.destroy(); document.body.innerHTML = ''; });

  it('inserts switch and contract link immediately before the complete user item, preserving clicks and original DOM', async () => {
    const s = setup(); runtime = s.runtime;
    const original = document.body.innerHTML;
    const avatar = document.querySelector('.user-img-avatar')!;
    const action = avatar.closest('a')!;
    const clicked = vi.fn(); action.addEventListener('click', clicked);
    await runtime.start();
    const user = document.querySelector('#user')!;
    const link = user.previousElementSibling as HTMLAnchorElement;
    const label = link.previousElementSibling!;
    expect(label.tagName).toBe('LABEL');
    expect(document.querySelector('.mp-nav-design-picker')).toBeNull();
    expect(label.querySelector('input')?.getAttribute('role')).toBe('switch');
    expect(link.textContent).toBe('대한민국');
    expect(link.href).toBe(SOUTH_KOREA_AREA_URL);
    expect(link.target).toBe('');
    expect(user.contains(label)).toBe(false);
    action.click(); expect(clicked).toHaveBeenCalledTimes(1);
    s.shell.mount(vi.fn());
    document.querySelector('#user')!.append(document.createElement('span'));
    await flush();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(2);
    document.querySelector('#user > span')!.remove();
    runtime.destroy();
    expect(document.body.innerHTML).toBe(original);
    expect(document.head.textContent).not.toContain('.mp-nav-control');
    expect(document.querySelector('.user-img-avatar')).toBe(avatar);
  });

  it('persists OFF before disabling the page, keeps controls, and follows external popup changes', async () => {
    const s = setup(); runtime = s.runtime; await runtime.start();
    const input = document.querySelector('input')!;
    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    input.click();
    expect(s.settings.setEnabled).toHaveBeenCalledWith(false);
    expect(s.page.disable).not.toHaveBeenCalled();
    finish(); await flush();
    expect(s.page.disable).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(false);
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(2);
    s.emit(true);
    expect(input.checked).toBe(true);
    expect(s.page.enable).toHaveBeenCalledTimes(2);
    s.emit(false);
    expect(input.checked).toBe(false);
  });

  it('mounts while initially disabled and reconciles logout, header replacement, and late arrival', async () => {
    const s = setup(false); runtime = s.runtime; await runtime.start();
    expect(document.querySelector('input')!.checked).toBe(false);
    document.querySelector('#header-container')!.outerHTML = header(false);
    await flush();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(2);
    expect(document.querySelector('#user')!.previousElementSibling!.textContent).toBe('대한민국');
    document.querySelector('#header-container')!.remove(); await flush();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(0);
    document.body.insertAdjacentHTML('afterbegin', header()); await flush();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(2);
    expect(document.querySelector('input')!.checked).toBe(false);
    runtime.destroy();
    document.body.innerHTML = header(); await flush();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(0);
  });

  it('supports direct avatar anchors and separate responsive user areas, excluding content avatars', async () => {
    const s = setup(); runtime = s.runtime;
    document.body.innerHTML = `<div id="header-container"><div class="header-container__user"><a id="desktop" href="/user/123"><img class="user-img-avatar"></a></div><div class="header-container__user"><div id="user"><div role="button"><div class="user-img-avatar"></div></div></div></div></div><main><a href="/user/456"><img class="user-img-avatar"></a></main>`;
    await runtime.start();
    expect(document.querySelectorAll('.mp-nav-control')).toHaveLength(4);
    expect(document.querySelector('#desktop')!.previousElementSibling!.textContent).toBe('대한민국');
    expect(document.querySelector('main .mp-nav-control')).toBeNull();
    const inputs = document.querySelectorAll('input');
    inputs[0]!.click(); await flush();
    expect([...inputs].every((input) => !input.checked)).toBe(true);
  });

  it('keeps the native control DOM and exposes the measured header inset contract', async () => {
    const s = setup(); runtime = s.runtime;
    const nativeUser = document.querySelector('#user')!;
    const nativeAction = nativeUser.querySelector('a')!;
    await runtime.start();

    const style = [...document.head.querySelectorAll('style')]
      .find((candidate) => candidate.textContent?.includes('.mp-nav-control'))?.textContent ?? '';
    const responsiveUserRule = style.match(
      /#header-container \.header-container__user:has\(\.mp-nav-control\) \{([^}]*)\}/,
    )?.[1] ?? '';
    expect(responsiveUserRule).toContain('display: flex');
    expect(responsiveUserRule).toContain('flex: 1 1 auto');
    expect(responsiveUserRule).toContain('align-content: center');
    expect(responsiveUserRule).toContain('justify-content: flex-end');
    expect(responsiveUserRule).toContain('flex-wrap: wrap');
    expect(responsiveUserRule).toContain('min-width: 0');
    expect(responsiveUserRule).toContain('max-width: calc(100% - 1rem)');
    expect(responsiveUserRule).toContain('margin: .5rem .5rem .5rem auto');
    expect(responsiveUserRule).toContain('--mp-nav-gap: .5rem');
    expect(responsiveUserRule).toContain('padding: 0 .5rem 0 0');
    expect(responsiveUserRule).toContain('column-gap: var(--mp-nav-gap)');
    expect(responsiveUserRule).toContain('row-gap: .5rem');
    expect(nativeUser.querySelector('a')).toBe(nativeAction);
    expect(nativeAction.closest('.mp-nav-control')).toBeNull();
  });

  it('restores the stored state and exposes an error when saving fails', async () => {
    const s = setup(); runtime = s.runtime; await runtime.start();
    vi.mocked(s.settings.setEnabled).mockRejectedValue(new Error('storage unavailable'));
    const input = document.querySelector('input')!; input.click(); await flush();
    expect(input.checked).toBe(true);
    expect(input.disabled).toBe(false);
    expect(document.querySelector('[role=status]')!.textContent).toContain('저장하지 못했습니다');
    expect(s.page.disable).not.toHaveBeenCalled();
    const error = document.querySelector<HTMLElement>('.mp-nav-error')!;
    expect(error.hidden).toBe(false);
    expect(error.closest('label')).toBeNull();
    error.click(); await flush();
    expect(s.settings.setEnabled).toHaveBeenCalledTimes(1);
    s.emit(false);
    expect(error.hidden).toBe(true);
    vi.mocked(s.settings.setEnabled).mockResolvedValue(undefined);
    input.click(); await flush();
    expect(error.hidden).toBe(true);
    expect(input.checked).toBe(true);
  });
});
