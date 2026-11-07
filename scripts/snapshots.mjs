// Visual regression helper for refactors. Serves dist/ locally and screenshots every section
// at 3 widths, in both themes and both languages, with headless Chrome/Edge.
//
//   pnpm build && node scripts/snapshots.mjs .snapshots/baseline      # capture
//   pnpm build && node scripts/snapshots.mjs .snapshots/current       # capture again
//   node scripts/snapshots.mjs --compare .snapshots/baseline .snapshots/current
//
// DIST=<folder> serves another build (e.g. a pristine copy of the original) instead of ./dist.
// Screenshots are compared pixel by pixel with a small tolerance (anti-aliasing and the live clock
// add noise). Differences are listed by name so you can open the two files.
import { createServer } from 'node:http';
import { inflateSync } from 'node:zlib';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const dist = process.env.DIST ? resolve(process.env.DIST) : join(root, 'dist');
const args = process.argv.slice(2);

// Minimal PNG decoder (8-bit, non-interlaced RGB/RGBA): enough to compare Chrome screenshots.
const decodePng = (buf) => {
  let pos = 8, width = 0, height = 0, bpp = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0 || ![2, 6].includes(data[9])) throw new Error('Unsupported PNG format');
      bpp = data[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), stride = width * bpp, px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[dst + x - bpp] : 0, b = y ? px[dst - stride + x] : 0, c = x >= bpp && y ? px[dst - stride + x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      px[dst + x] = (raw[src + x] + pred) & 255;
    }
  }
  return { width, height, bpp, px };
};

// Fraction of pixels whose channels differ by more than 8/255. Anti-aliasing and the live clock
// produce a little noise, so a screenshot only counts as different above THRESHOLD.
const THRESHOLD = 0.0005;
const compare = (fa, fb) => {
  const A = decodePng(readFileSync(fa)), B = decodePng(readFileSync(fb));
  if (A.width !== B.width || A.height !== B.height) return { ratio: 1, note: 'size differs' };
  let bad = 0;
  for (let i = 0; i < A.width * A.height; i++) {
    for (let c = 0; c < 3; c++) if (Math.abs(A.px[i * A.bpp + c] - B.px[i * B.bpp + c]) > 8) { bad++; break; }
  }
  return { ratio: bad / (A.width * A.height) };
};

if (args[0] === '--compare') {
  const [a, b] = [args[1], args[2]];
  if (!a || !b) throw new Error('Usage: --compare <dirA> <dirB>');
  const names = new Set([...readdirSync(a), ...readdirSync(b)]);
  const diff = [];
  let worst = 0;
  for (const n of [...names].sort()) {
    if (!existsSync(join(a, n)) || !existsSync(join(b, n))) { diff.push(`${n} (missing on one side)`); continue; }
    const { ratio, note } = compare(join(a, n), join(b, n));
    worst = Math.max(worst, ratio);
    if (ratio > THRESHOLD) diff.push(`${n}  ${(ratio * 100).toFixed(2)}% of pixels${note ? ` (${note})` : ''}`);
  }
  console.log(diff.length ? ['DIFFERENT (' + diff.length + '/' + names.size + '):', ...diff.map((d) => '  ' + d)].join(String.fromCharCode(10)) : `EQUIVALENT (${names.size} screenshots, worst ${(worst * 100).toFixed(3)}% of pixels)`);
  process.exit(diff.length ? 1 : 0);
}

const out = args[0] && resolve(args[0]);
if (!out) throw new Error('Usage: node scripts/snapshots.mjs <outDir>');
if (!existsSync(dist)) throw new Error('dist/ not found. Run `pnpm build` first.');
mkdirSync(out, { recursive: true });

const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.pdf': 'application/pdf' };
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = join(dist, decodeURIComponent(url.pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  let body = readFileSync(file);
  if (extname(file) === '.html') {
    // Force the theme and drop any saved language, so every capture starts from the same state.
    const theme = url.searchParams.get('theme') ?? 'dark';
    const pin = url.searchParams.has('short') ? '' : '<style>.hero__inner{min-height:calc(800px - var(--header-h)) !important}</style>';
    body = Buffer.from(body.toString().replace('<head>', `<head>${pin}<script>try{localStorage.setItem('theme','${theme}');localStorage.removeItem('lang')}catch(e){}</script>`));
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

// One full-page capture per width/theme/language (a tall window; the hero's 100svh is pinned to 800px
// so it does not stretch), plus one short-window capture of the hero (1280x700) for its compact layout.
// SIZES="600,850" overrides the widths; QUICK=1 keeps dark + EN only.
const FULL_H = Number(process.env.HEIGHT) || 7200;
const widths = process.env.SIZES ? process.env.SIZES.split(',').map(Number) : [375, 768, 1280];
const themes = process.env.QUICK ? ['dark'] : ['dark', 'light'];
const langs = process.env.QUICK ? [['en', '/']] : [['en', '/'], ['es', '/es/']];

// Async on purpose: the local server lives in this process and must keep answering while Chrome loads.
const jobs = [];
for (const theme of themes) for (const [lang, path] of langs) {
  for (const w of widths) jobs.push({ name: `${w}-${theme}-${lang}.png`, w, h: FULL_H, theme, path, short: false });
  jobs.push({ name: `short-1280x700-${theme}-${lang}.png`, w: 1280, h: 700, theme, path, short: true });
}

const shoot = async ({ name, w, h, theme, path, short }) => {
  const profile = mkdtempSync(join(tmpdir(), 'snap-'));
  try {
    await run(browser, ['--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--force-prefers-reduced-motion',
      `--user-data-dir=${profile}`, `--window-size=${w},${h}`, '--virtual-time-budget=7000',
      `--screenshot=${join(out, name)}`, `http://127.0.0.1:${port}${path}?theme=${theme}${short ? '&short=1' : ''}`], { timeout: 60_000 });
  } finally { rmSync(profile, { recursive: true, force: true }); }
};

const queue = [...jobs];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await shoot(queue.shift()); }));
server.close();
console.log(`${jobs.length} screenshots written to ${out}`);
