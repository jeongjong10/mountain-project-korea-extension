export type PageKind =
  | 'main'
  | 'area'
  | 'route'
  | 'route-stats'
  | 'route-finder'
  | 'photo'
  | 'user'
  | 'contact-user'
  | 'unsupported';

const SUPPORTED_HOSTS = new Set([
  'mountainproject.com',
  'www.mountainproject.com',
]);

export function detectPage(url: URL): PageKind {
  if (!SUPPORTED_HOSTS.has(url.hostname)) {
    return 'unsupported';
  }

  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path === '/') {
    return 'main';
  }
  if (/^\/area\/\d+(?:\/[^/]+)?$/.test(path)) {
    return 'area';
  }
  if (/^\/route\/\d+(?:\/[^/]+)?$/.test(path)) {
    return 'route';
  }
  if (/^\/route\/stats\/\d+(?:\/[^/]+)?$/.test(path)) {
    return 'route-stats';
  }
  if (path === '/route-finder') {
    return 'route-finder';
  }
  if (/^\/photo\/\d+(?:\/[^/]+)?$/.test(path)) {
    return 'photo';
  }
  if (/^\/user\/\d+\/[^/]+(?:\/(?:contributions|community))?$/.test(path)) {
    return 'user';
  }
  if (/^\/contact-user\/\d+$/.test(path)) {
    return 'contact-user';
  }
  return 'unsupported';
}
