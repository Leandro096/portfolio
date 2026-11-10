import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (...p) => join(root, ...p);
const b64 = (file) => readFileSync(file).toString("base64");

const grotesk = at(
  "src",
  "assets",
  "fonts",
  "space-grotesk-latin-wght-normal.woff2",
);
const mono = at(
  "src",
  "assets",
  "fonts",
  "jetbrains-mono-latin-wght-normal.woff2",
);

const C = {
  bg: "#0a0f1e",
  surface: "#111830",
  text: "#f4f7fb",
  muted: "#98a4c0",
  cyan: "#38d9f5",
  mint: "#5cf2b0",
  line: "rgba(244,247,251,.14)",
};

const fonts = `
  @font-face { font-family: 'SG'; font-weight: 300 700; src: url(data:font/woff2;base64,${b64(grotesk)}) format('woff2'); }
  @font-face { font-family: 'JB'; font-weight: 100 800; src: url(data:font/woff2;base64,${b64(mono)}) format('woff2'); }`;

const mark = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s / 130}) translate(-40 -36)">
    <path d="M55 46 H87 V122 H107 V154 H55 Z" fill="${C.cyan}" stroke="${C.cyan}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="119" y="122" width="26" height="32" rx="4" fill="${C.mint}"/>
  </g>`;

// Brand avatar ("Foto de perfil"): circle with a 6px cyan ring, logo mark inside.
const R = 150,
  CX = 990,
  CY = 330,
  S = 182; // logo size inside the ring
const avatar = `<circle cx="${CX}" cy="${CY}" r="${R - 3}" fill="${C.bg}" stroke="${C.cyan}" stroke-width="6"/>
  ${mark(CX - (58.5 * S) / 130, CY - (64 * S) / 130, S)}`;
// 58.5 / 64 = centre of the drawn mark (x 12-105, y 7-121) inside its 130 box, so the ink is centred in the ring.

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>${fonts}
    .n { font-family: SG, sans-serif; font-weight: 700; font-size: 88px; letter-spacing: -2.6px; fill: ${C.text}; }
    .r { font-family: JB, monospace; font-weight: 500; font-size: 21px; letter-spacing: 3px; fill: ${C.cyan}; }
    .w1 { font-family: SG, sans-serif; font-weight: 700; font-size: 46px; letter-spacing: -1.2px; fill: ${C.text}; }
    .w2 { font-family: JB, monospace; font-weight: 500; font-size: 31px; fill: ${C.mint}; }
    .s { font-family: JB, monospace; font-weight: 500; font-size: 19px; letter-spacing: 2px; fill: ${C.muted}; }
  </style>
  <rect width="1200" height="630" fill="${C.bg}"/>
  ${mark(72, 62, 64)}
  <text x="150" y="116"><tspan class="w1">leangar</tspan><tspan class="w2">.dev</tspan></text>
  <text class="n" x="68" y="352">Leandro J. Garcia</text>
  <text class="r" x="72" y="412">FULL-STACK SOFTWARE ENGINEER</text>
  <text class="s" x="72" y="456">ASP.NET CORE · REACT · TYPESCRIPT</text>
  ${avatar}
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${C.bg}"/>
  ${mark(46, 38, 88)}
</svg>`;

mkdirSync(at("scripts", "og"), { recursive: true });
writeFileSync(at("scripts", "og", "og.svg"), card);
writeFileSync(at("scripts", "og", "apple-touch-icon.svg"), icon);

const browser = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
if (!browser)
  throw new Error(
    "No Chrome/Edge found. Set CHROME_PATH or export scripts/og/*.svg manually.",
  );

const render = (svg, w, h, out) => {
  const html = join(tmpdir(), `og-${Date.now()}.html`);
  writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0a0f1e}svg{display:block}</style>${svg}`,
  );
  execFileSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${w},${h}`,
      "--virtual-time-budget=2000",
      `--screenshot=${out}`,
      `file:///${html.replace(/\\/g, "/")}`,
    ],
    { stdio: "ignore" },
  );
};

render(card, 1200, 630, at("public", "og.png"));
render(icon, 180, 180, at("public", "apple-touch-icon.png"));
console.log("public/og.png and public/apple-touch-icon.png written.");
