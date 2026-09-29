/**
 * Shared values taken from the existing MP Korea controls.
 * Native MP content keeps its inherited typography and layout.
 * See docs/design-system.md for source decisions and component-specific exceptions.
 */
/** Dark navigation palette approved by the user on 2026-09-28. */
export const NAV = {
  surface: '#202124',
  surfaceHover: '#2c3036',
  border: '#5f6368',
  divider: '#5f6368',
  text: '#fff',
  link: '#91c3e8',
  muted: '#b8c6d4',
  focus: '#91c3e8',
  switchOff: '#5f6368',
  switchBorder: '#7a8791',
  switchThumb: '#fff',
  switchOn: '#5ba2d8',
  switchOnThumb: '#fff',
  height: '38px',
  fontSize: '12px',
} as const;

export const UI = {
  nav: NAV,
  color: {
    text: '#202124',
    muted: '#59635d',
    link: '#0060a9',
    linkHover: '#004b84',
    linkActive: '#003e70',
    surface: '#fff',
    surfaceSubtle: '#f7f8f8',
    surfaceHover: '#edf5fa',
    border: '#c8ceca',
    borderHover: '#9eabb3',
    warning: '#6b5b35',
    accentSurface: '#e8f0eb',
    accentText: '#294c39',
    buttonSurface: '#f1f5f9',
    buttonHover: '#e4edf5',
    buttonActive: '#d8e5f0',
    buttonBorder: '#b8c6d4',
    buttonBorderHover: '#7f9bb5',
    headingHover: 'rgba(0, 96, 169, 0.12)',
    headingFocus: 'rgba(0, 96, 169, 0.14)',
  },
  font: {
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    caption: '0.75rem',
    small: '0.85rem',
    hint: '0.9rem',
    body: '1rem',
    controlWeight: '600',
    bodyLineHeight: '1.65',
    uiLineHeight: '1.5',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  radius: {
    small: '2px',
    control: '4px',
    nav: '7px',
  },
  motion: { fast: '150ms ease' },
} as const;

/** Popup/review CSS consumes the same values as the injected component styles. */
export const UI_TOKEN_CSS = `:root {${Object.entries(UI).flatMap(([group, values]) =>
  Object.entries(values).map(([name, value]) =>
    `--mpkr-${group}-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value};`,
  ),
).join('')}}`;
