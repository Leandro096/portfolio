/**
 * URL of a file in /public, honouring Astro's `base`.
 * asset('favicon.svg') -> '/favicon.svg' (or '/sub/favicon.svg' when deployed under /sub/).
 */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
