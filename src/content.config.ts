import { defineCollection, reference } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";
import { experience as experienceData } from "./data/experience";
import { projects as projectsData } from "./data/projects";

const l10n = z.object({ en: z.string(), es: z.string() });
const text = z.union([z.string(), l10n]);
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");
const order = z.number().default(0);

const pipelineStage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("step"), name: text, meta: text.optional() }),
  z.object({
    type: z.literal("parallel"),
    label: text,
    jobs: z.array(text).min(1),
  }),
]);

const profile = defineCollection({
  loader: file("src/data/profile.json"),
  schema: z.object({
    name: z.string(),
    role: l10n,
    description: l10n,
    headline: l10n,
    lead: l10n,
    location: l10n,
    spokenLanguages: l10n,
    email: z.email(),
    phone: z.string(),
    whatsapp: z.string().regex(/^\d{8,15}$/, "Digits only, with country code"),
    whatsappMessage: l10n,
    timezone: z.string(),
    timezoneLabel: z.string(),
    availableTimezones: z.string(),
    cv: l10n,
    social: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    seo: z.object({
      title: l10n,
      description: l10n,
      about: l10n,
      city: l10n,
      country: l10n,
      countryCode: z.string().length(2),
      alternateNames: z.array(z.string()).default([]),
      alsoKnownAs: z.object({
        en: z.array(z.string()),
        es: z.array(z.string()),
      }),
      expertise: z.object({ en: z.array(z.string()), es: z.array(z.string()) }),
    }),
    pipeline: z.object({
      title: l10n,
      stages: z.array(pipelineStage).min(1),
      result: z.object({ value: z.string(), label: l10n }),
    }),
  }),
});

const toolGroups = defineCollection({
  loader: file("src/data/tool-groups.json"),
  schema: z.object({ order, title: l10n }),
});

const tools = defineCollection({
  loader: file("src/data/tools.json"),
  schema: z.object({
    name: text,
    order,
    group: reference("toolGroups"),
    concept: z.boolean().default(false),
    logo: z.string().optional(),
    logoDark: z.boolean().default(false),
  }),
});

const experience = defineCollection({
  loader: () => experienceData,
  schema: z.object({
    order,
    type: z.enum(["job", "volunteer"]).default("job"),
    role: text,
    organization: text,
    location: text.optional(),
    start: yearMonth.optional(),
    end: z.union([yearMonth, z.literal("present")]).optional(),
    highlights: z.array(l10n),
    stack: z.array(reference("tools")).default([]),
  }),
});

const projects = defineCollection({
  loader: () => projectsData,
  schema: z.object({
    order,
    title: l10n,
    organization: text,
    role: text,
    summary: l10n,
    outcomes: z.array(z.object({ lead: l10n, text: l10n })).default([]),
    metrics: z
      .array(
        z.object({
          value: z.number(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          label: l10n,
        }),
      )
      .default([]),
    flow: z
      .array(z.array(z.object({ title: l10n, note: l10n.optional() })))
      .optional(),
    stack: z.array(reference("tools")).default([]),
    links: z.array(z.object({ label: l10n, url: z.url() })).default([]),
  }),
});

const education = defineCollection({
  loader: file("src/data/education.json"),
  schema: z.object({
    order,
    title: text,
    description: text,
    progress: z.number().min(0).max(100),
  }),
});

export const collections = {
  profile,
  toolGroups,
  tools,
  experience,
  projects,
  education,
};
