import { tr, langs, homePath, type Lang } from "../i18n";
import type { Profile } from "./content";

export function buildJsonLd(opts: {
  profile: Profile;
  lang: Lang;
  site: URL;
  skills: string[];
}) {
  const { profile, lang, site, skills } = opts;
  const seo = profile.seo;
  const url = (l: Lang) => new URL(homePath(l), site).href;
  const personId = `${new URL("/", site).href}#person`;
  const websiteId = `${new URL("/", site).href}#website`;

  const city = {
    "@type": "City",
    name: tr(seo.city, lang),
    containedInPlace: {
      "@type": "Country",
      name: tr(seo.country, lang),
    },
  };

  const person = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    alternateName: seo.alternateNames,
    url: url(lang),
    jobTitle: tr(profile.role, lang),
    description: tr(profile.lead, lang),
    address: {
      "@type": "PostalAddress",
      addressLocality: tr(seo.city, lang),
      addressCountry: seo.countryCode,
    },
    homeLocation: city,
    sameAs: profile.social.map((s) => s.url),
    knowsLanguage: ["es", "en"],
    knowsAbout: [...seo.expertise[lang], ...skills],
    hasOccupation: seo.alsoKnownAs[lang].map((name) => ({
      "@type": "Occupation",
      name,
      occupationLocation: city,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: new URL("/", site).href,
        name: "leangar.dev",
        inLanguage: langs,
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url(lang)}#profilepage`,
        url: url(lang),
        name: tr(seo.title, lang),
        description: tr(seo.description, lang),
        inLanguage: lang,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
      },
      person,
    ],
  };
}

export const jsonForScript = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");
