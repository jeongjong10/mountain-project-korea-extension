// The persistent header's user area is separate from the collapsed mobile menu.
export const NAVIGATION_HEADER = '#header-container';
export const NAVIGATION_USER = '.header-container__user';

export function navigationUserItems(root: ParentNode): HTMLElement[] {
  const result = new Set<HTMLElement>();
  for (const userArea of root.querySelectorAll(`${NAVIGATION_HEADER} ${NAVIGATION_USER}`)) {
    const avatar = userArea.querySelector('.user-img-avatar');
    const action = avatar?.closest('#user, a, button, [role="button"]')
      ?? userArea.querySelector('#user a, #user button, a.sign-in');
    if (!(action instanceof HTMLElement)) continue;
    // Keep dropdown children and the avatar's complete click target together.
    const item = action.closest<HTMLElement>('#user, .nav-item, li');
    const target = item && userArea.contains(item) ? item : action;
    result.add(target);
  }
  return [...result];
}
