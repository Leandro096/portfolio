import { langs, homePath, tr, ui, type Lang } from "../i18n";
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getToolGroups,
  getToolNames,
  formatPeriod,
  toolLabels,
} from "./content";

const abs = (path: string, site: URL) => new URL(path, site).href;

const heading = {
  en: {
    about: "About",
    facts: "Key facts",
    location: "Location",
    availability: "Availability",
    languages: "Languages",
    also: "Also described as",
    expertise: "Areas of expertise",
    experience: "Experience",
    projects: "Selected projects",
    skills: "Skills and tools",
    education: "Education",
    stack: "Stack",
    role: "Role",
    results: "Results",
    profiles: "Profiles",
    present: "Present",
  },
  es: {
    about: "Acerca de",
    facts: "Datos clave",
    location: "Ubicación",
    availability: "Disponibilidad",
    languages: "Idiomas",
    also: "También descrito como",
    expertise: "Áreas de especialidad",
    experience: "Experiencia",
    projects: "Proyectos destacados",
    skills: "Habilidades y herramientas",
    education: "Educación",
    stack: "Stack",
    role: "Rol",
    results: "Resultados",
    profiles: "Perfiles",
    present: "Actualidad",
  },
} as const;

export async function buildLlmsTxt(site: URL): Promise<string> {
  const p = await getProfile();
  const base = abs("/", site);
  const lines = [
    `# ${p.name}`,
    "",
    `> ${tr(p.seo.description, "en")}`,
    "",
    `${tr(p.seo.description, "es")}`,
    "",
    `- Location: ${tr(p.location, "en")}`,
    `- Availability: remote, ${p.availableTimezones}`,
    `- Also described as: ${p.seo.alsoKnownAs.en.join("; ")}`,
    `- Spoken languages: ${tr(p.spokenLanguages, "en")}`,
    "",
    "## Site",
    "",
    ...langs.map(
      (l) =>
        `- [${l === "en" ? "Portfolio (English)" : "Portafolio (Español)"}](${abs(homePath(l), site)}): ${tr(p.seo.description, l)}`,
    ),
    `- [Full profile for LLMs](${abs("/llms-full.txt", site)}): experience, projects, skills and education in plain Markdown, English and Spanish`,
    "",
    "## Documents",
    "",
    `- [CV, English (PDF)](${abs(tr(p.cv, "en"), site)})`,
    `- [CV, Español (PDF)](${abs(tr(p.cv, "es"), site)})`,
    "",
    `## ${heading.en.profiles}`,
    "",
    ...p.social.map((s) => `- [${s.label}](${s.url})`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${abs("/sitemap.xml", site)})`,
    `- Contact: use the contact section at ${base}#contact`,
    "",
  ];
  return lines.join("\n");
}

async function section(lang: Lang, site: URL): Promise<string> {
  const h = heading[lang];
  const t = ui[lang];
  const [p, jobs, projects, groups, education, names] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getToolGroups(lang),
    getEducation(),
    getToolNames(lang),
  ]);
  const out: string[] = [];
  const push = (...l: string[]) => out.push(...l);

  push(
    `## ${lang === "en" ? "English" : "Español"} (${abs(homePath(lang), site)})`,
    "",
  );
  push(`### ${h.about}`, "", tr(p.seo.about, lang), "", tr(p.lead, lang), "");
  push(`### ${h.facts}`, "");
  push(`- ${h.location}: ${tr(p.location, lang)}`);
  push(`- ${h.availability}: ${t.remoteWork}, ${p.availableTimezones}`);
  push(`- ${h.languages}: ${tr(p.spokenLanguages, lang)}`);
  push(`- ${h.also}: ${p.seo.alsoKnownAs[lang].join("; ")}`);
  push(`- ${h.expertise}: ${p.seo.expertise[lang].join("; ")}`, "");

  push(`### ${h.experience}`, "");
  for (const j of jobs) {
    const d = j.data;
    const period = formatPeriod(d.start, d.end, h.present, lang);
    push(`#### ${tr(d.role, lang)}, ${tr(d.organization, lang)}`, "");
    push(
      `${[d.location && tr(d.location, lang), period].filter(Boolean).join(" · ")}`,
      "",
    );
    for (const hl of d.highlights) push(`- ${tr(hl, lang)}`);
    const stack = toolLabels(d.stack, names);
    if (stack.length) push("", `${h.stack}: ${stack.join(", ")}`);
    push("");
  }

  push(`### ${h.projects}`, "");
  for (const pr of projects) {
    const d = pr.data;
    push(`#### ${tr(d.title, lang)}`, "");
    push(`${h.role}: ${tr(d.role, lang)}, ${tr(d.organization, lang)}`, "");
    push(tr(d.summary, lang), "");
    if (d.outcomes.length) {
      push(`${h.results}:`, "");
      for (const o of d.outcomes)
        push(`- ${tr(o.lead, lang)} ${tr(o.text, lang)}`);
      push("");
    }
    for (const m of d.metrics)
      push(
        `- ${m.prefix ?? ""}${m.value}${m.suffix ?? ""} ${tr(m.label, lang)}`,
      );
    if (d.metrics.length) push("");
    const stack = toolLabels(d.stack, names);
    if (stack.length) push(`${h.stack}: ${stack.join(", ")}`, "");
  }

  push(`### ${h.skills}`, "");
  for (const g of groups)
    push(`- ${g.title}: ${g.items.map((i) => i.name).join(", ")}`);
  push("");

  push(`### ${h.education}`, "");
  for (const e of education)
    push(`- ${tr(e.data.title, lang)}. ${tr(e.data.description, lang)}`);
  push("");
  return out.join("\n");
}

export async function buildLlmsFullTxt(site: URL): Promise<string> {
  const p = await getProfile();
  const head = [
    `# ${p.name}: ${tr(p.role, "en")} / ${tr(p.role, "es")}`,
    "",
    `> ${tr(p.seo.description, "en")}`,
    `> ${tr(p.seo.description, "es")}`,
    "",
    `Also known as: ${p.seo.alternateNames.join(", ")}.`,
    `${heading.en.profiles}: ${p.social.map((s) => `[${s.label}](${s.url})`).join(", ")}.`,
    "",
  ].join("\n");
  const sections = [];
  for (const l of langs) sections.push(await section(l, site));
  return `${head}\n${sections.join("\n")}`;
}
