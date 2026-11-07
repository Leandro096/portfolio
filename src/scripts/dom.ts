/** Shared helpers for the browser scripts. */
export const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
