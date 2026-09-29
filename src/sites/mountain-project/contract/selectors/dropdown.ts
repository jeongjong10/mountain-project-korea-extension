const DROPDOWN_MENU_ROOTS = [
  '.dropdown .dropdown-menu',
  '.dropdown-toggle + .dropdown-menu',
  '.dropdown-toggle ~ .dropdown-menu',
  '[data-toggle="dropdown"] + .dropdown-menu',
  '[data-toggle="dropdown"] ~ .dropdown-menu',
  '.dropdown-menu[aria-labelledby]',
].join(', ');

const DROPDOWN_ITEM = [
  'a',
  'button',
  '[role="menuitem"]',
  '.dropdown-item',
  '.dropdown-header',
].join(', ');

const withinDropdownMenu = (selector: string): string =>
  DROPDOWN_MENU_ROOTS.split(', ')
    .map((root) => `${root} ${selector}`)
    .join(', ');

/** Fixed dropdown chrome only. Authored/entity data is protected separately. */
export const DROPDOWN_SELECTORS = {
  trigger: [
    '.dropdown-toggle',
    '[data-toggle="dropdown"]',
  ].join(', '),
  triggerLabel: '.dropdown-toggle *, [data-toggle="dropdown"] *',
  menuItem: withinDropdownMenu(`:is(${DROPDOWN_ITEM})`),
  menuItemLabel: withinDropdownMenu(`:is(${DROPDOWN_ITEM}) *`),
  routeTypeLabel: '#route-type-label',
  routeTypeOption: '.route-type-option',
  commentSortLabel: '#sort-dropdown > strong, #sort-dropdown > .current-sort',
  commentSortOption: '.dropdown-menu .comments-sort',
  headerFixedItem: [
    `#header-container .header-container__user .dropdown-menu :is(${DROPDOWN_ITEM})`,
    `#user-dropdown-menu :is(${DROPDOWN_ITEM})`,
  ].join(', '),
  protectedAuthoredData: [
    '.user-display-name',
    '.user-name',
    '.username',
    '[rel="author"]',
    '.comment-author',
    '.author',
    '.photo-title',
    '.photo-caption',
    '.photo-description',
    '.fr-view',
    '[contenteditable="true"]',
    'textarea',
  ].join(', '),
} as const;

export const DROPDOWN_UI_SELECTOR = [
  DROPDOWN_SELECTORS.trigger,
  DROPDOWN_SELECTORS.triggerLabel,
  DROPDOWN_SELECTORS.menuItem,
  DROPDOWN_SELECTORS.menuItemLabel,
  DROPDOWN_SELECTORS.routeTypeLabel,
  DROPDOWN_SELECTORS.routeTypeOption,
  DROPDOWN_SELECTORS.commentSortLabel,
  DROPDOWN_SELECTORS.commentSortOption,
].join(', ');
