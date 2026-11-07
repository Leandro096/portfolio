import { asset } from "../lib/assets";

export const languages = { en: "English", es: "Español" } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";
export const langs = Object.keys(languages) as Lang[];

export type L10n = { en: string; es: string };
export type Text = string | L10n;

export const tr = (value: Text, lang: Lang): string =>
  typeof value === "string" ? value : value[lang];

export const homePath = (lang: Lang): string =>
  asset(lang === defaultLang ? "" : `${lang}/`);

export { ui, type UIKey } from "./ui";
