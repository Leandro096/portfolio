import type { APIRoute } from "astro";

const crawlers = [
  // OpenAI
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckAssistBot",
  "MistralAI-User",
  "meta-externalagent",
  "Amazonbot",
  "CCBot",
];

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("/sitemap.xml", site).href;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    ...crawlers.map((c) => `User-agent: ${c}`),
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
