// Shapes of the hand-written content in src/data/*.ts.
// Only `import type` may be used from data files: scripts/make-cv.mjs loads them with Node's native
// type stripping, which erases types but cannot resolve anything else. The build-time source of truth
// is the Zod schema in src/content.config.ts (it also checks that every `stack` id exists in tools.json).

export type L10n = { en: string; es: string };
/** A plain string (same in both languages) or a translated pair. */
export type Text = string | L10n;
/** "YYYY-MM" */
export type YearMonth = string;

export type Experience = {
  /** Slug, unique across the array. */
  id: string;
  /** Lower comes first. */
  order: number;
  type?: "job" | "volunteer";
  role: Text;
  organization: Text;
  location?: Text;
  start?: YearMonth;
  end?: YearMonth | "present";
  highlights: L10n[];
  /** Tool ids from tools.json. */
  stack?: string[];
};

export type Project = {
  /** Slug, unique across the array. */
  id: string;
  /** Lower comes first. */
  order: number;
  title: L10n;
  organization: Text;
  role: Text;
  summary: L10n;
  outcomes?: { lead: L10n; text: L10n }[];
  /** 1 = big number, 2+ = list. */
  metrics?: { value: number; prefix?: string; suffix?: string; label: L10n }[];
  /** Process diagram: each inner array is one step (several items = parallel branches). */
  flow?: { title: L10n; note?: L10n }[][];
  /** Tool ids from tools.json. */
  stack?: string[];
  links?: { label: L10n; url: string }[];
};
