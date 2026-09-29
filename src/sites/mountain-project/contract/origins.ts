export const MOUNTAIN_PROJECT_CANONICAL_ORIGIN = 'https://www.mountainproject.com';

export const MOUNTAIN_PROJECT_HOSTNAMES = [
  'mountainproject.com',
  'www.mountainproject.com',
] as const;

export const MOUNTAIN_PROJECT_MATCH_PATTERNS = [
  'https://mountainproject.com/*',
  'https://www.mountainproject.com/*',
] as const;

const supportedHostnames = new Set<string>(MOUNTAIN_PROJECT_HOSTNAMES);

export function isMountainProjectHostname(hostname: string): boolean {
  return supportedHostnames.has(hostname.toLowerCase());
}

export function isMountainProjectUrl(url: URL): boolean {
  return url.protocol === 'https:' && isMountainProjectHostname(url.hostname);
}

export function buildMountainProjectUrl(path: string): string {
  return new URL(path, MOUNTAIN_PROJECT_CANONICAL_ORIGIN).href;
}
