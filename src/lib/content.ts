import { getCollection, getEntry } from "astro:content";
import { tr, type Lang, type Text } from "../i18n";

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) =>
  a.data.order - b.data.order;

export async function getProfile() {
  const entry = await getEntry("profile", "main");
  if (!entry) throw new Error('Missing entry "main" in src/data/profile.json');
  return entry.data;
}

export async function getToolNames(lang: Lang): Promise<Map<string, string>> {
  const tools = await getCollection("tools");
  return new Map(tools.map((t) => [t.id, tr(t.data.name, lang)]));
}

export function toolLabels(
  refs: { id: string }[],
  names: Map<string, string>,
): string[] {
  return refs.map((r) => names.get(r.id) ?? r.id);
}

export type Profile = Awaited<ReturnType<typeof getProfile>>;
export type Pipeline = Profile["pipeline"];

export interface ToolItem {
  name: string;
  logo?: string;
  logoDark?: boolean;
  concept?: boolean;
}

export async function getToolMeta(lang: Lang): Promise<Map<string, ToolItem>> {
  const tools = await getCollection("tools");
  return new Map(
    tools.map((t) => [
      t.id,
      {
        name: tr(t.data.name, lang),
        logo: t.data.logo,
        logoDark: t.data.logoDark,
      },
    ]),
  );
}

export function toolItems(
  refs: { id: string }[],
  meta: Map<string, ToolItem>,
): ToolItem[] {
  return refs.map((r) => meta.get(r.id) ?? { name: r.id });
}

export async function getToolGroups(lang: Lang) {
  const [groups, tools] = await Promise.all([
    getCollection("toolGroups"),
    getCollection("tools"),
  ]);
  return groups.sort(byOrder).map((g) => ({
    id: g.id,
    title: tr(g.data.title, lang),
    items: tools
      .filter((t) => t.data.group.id === g.id)
      .sort(byOrder)
      .map(
        (t): ToolItem => ({
          name: tr(t.data.name, lang),
          logo: t.data.logo,
          logoDark: t.data.logoDark,
          concept: t.data.concept,
        }),
      ),
  }));
}

export const getExperience = async () =>
  (await getCollection("experience")).sort(byOrder);
export const getProjects = async () =>
  (await getCollection("projects")).sort(byOrder);
export const getEducation = async () =>
  (await getCollection("education")).sort(byOrder);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatMonth(ym: string, lang: Lang): string {
  const [y, m] = ym.split("-").map(Number);
  return cap(
    new Intl.DateTimeFormat(lang, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, 1))),
  ).replace(".", "");
}

export function formatPeriod(
  start: string | undefined,
  end: string | undefined,
  presentLabel: string,
  lang: Lang,
): string {
  if (!start) return "";
  const to = !end || end === "present" ? presentLabel : formatMonth(end, lang);
  return `${formatMonth(start, lang)} – ${to}`;
}

export const waUrl = (number: string, message?: string) =>
  `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export type { Text };
