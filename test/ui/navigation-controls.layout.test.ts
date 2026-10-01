import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { NAVIGATION_CONTROL_CSS } from '@/ui/navigation-control-style';

describe('navigation controls rendered against the Mountain Project header contract', () => {
  let fixture = '';

  beforeAll(async () => {
    const template = await readFile(
      resolve('test/fixtures/mountain-project/navigation-header.html'),
      'utf8',
    );
    fixture = template.replace('__MPKR_NAVIGATION_CONTROL_CSS__', NAVIGATION_CONTROL_CSS);
    await mkdir(resolve('.tmp'), { recursive: true });
    await writeFile(resolve('.tmp', 'navigation-header-render.html'), fixture);
  });

  beforeEach(() => {
    document.open();
    document.write(fixture);
    document.close();
  });

  it('uses the native MP spacing as the outer layout contract', () => {
    const header = getComputedStyle(document.querySelector<HTMLElement>('#header')!);
    const logo = getComputedStyle(document.querySelector<HTMLElement>('.app-logo')!);
    const tab = getComputedStyle(document.querySelector<HTMLElement>('#header-nav .tab a')!);
    const signIn = getComputedStyle(document.querySelector<HTMLElement>('#user .btn')!);
    const hamburger = getComputedStyle(document.querySelector<HTMLElement>('#hamburger-trigger')!);

    expect(header.paddingLeft).toBe('15px');
    expect(header.paddingRight).toBe('15px');
    expect(logo.marginTop).toBe('13px');
    expect(logo.marginBottom).toBe('13px');
    expect(tab.paddingLeft).toBe('10.5px');
    expect(tab.paddingRight).toBe('10.5px');
    expect(signIn.paddingLeft).toBe('14px');
    expect(signIn.paddingRight).toBe('14px');
    expect(hamburger.paddingLeft).toBe('7px');
    expect(hamburger.paddingRight).toBe('7px');
    expect(hamburger.marginRight).toBe('-7px');
  });

  it('keeps single and wrapped rows inset, right-aligned, and evenly separated', () => {
    const user = getComputedStyle(document.querySelector<HTMLElement>('.header-container__user')!);
    const headerLayout = getComputedStyle(document.querySelector<HTMLElement>('.header-container')!);

    expect(headerLayout.flexWrap).toBe('wrap');
    expect(headerLayout.columnGap).toBe('12px');
    expect(user.display).toBe('flex');
    expect(user.flexWrap).toBe('wrap');
    expect(user.alignItems).toBe('center');
    expect(user.alignContent).toBe('center');
    expect(user.justifyContent).toBe('flex-end');
    expect(user.maxWidth).toBe('calc(100% - 14px)');
    expect(user.marginTop).toBe('7px');
    expect(user.marginBottom).toBe('7px');
    expect(user.marginRight).toBe('7px');
    expect(user.paddingRight).toBe('7px');
    expect(user.columnGap).toBe('.5rem');
    expect(user.rowGap).toBe('.5rem');
  });
});
