import type { APIRoute } from "astro";
import { buildLlmsFullTxt } from "../lib/llms";

export const GET: APIRoute = async ({ site }) =>
  new Response(await buildLlmsFullTxt(site!), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
