import type { APIRoute } from "astro";
import { langs, homePath, defaultLang } from "../i18n";

export const GET: APIRoute = ({ site }) => {
  const at = (l: (typeof langs)[number]) => new URL(homePath(l), site).href;
  const alternates = [
    ...langs.map(
      (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${at(l)}"/>`,
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${at(defaultLang)}"/>`,
  ].join("");
  const urls = langs
    .map((l) => `<url><loc>${at(l)}</loc>${alternates}</url>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
