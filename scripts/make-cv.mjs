// Builds the two CVs (public/CV_Leandro_Garcia_-_English.pdf and ..._-_Espanol.pdf) from ONE source,
// so they cannot drift from each other or from the site:
//   - experience (roles, organizations, dates, bullets) comes from src/data/experience.ts, the same
//     array the portfolio renders;
//   - name, e-mail, phone and location come from src/data/profile.json;
//   - the rest (summary, education, skills, headings) lives in scripts/cv/cv.json.
// Run:  node scripts/make-cv.mjs      (needs Chrome or Edge; Calibri/Carlito for the exact look)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (...p) => join(root, ...p);
const json = (...p) => JSON.parse(readFileSync(at(...p), 'utf8'));

const cv = json('scripts', 'cv', 'cv.json');
const profile = json('src', 'data', 'profile.json').main;
// Node strips the types natively (>= 23.6); src/data/experience.ts only uses `import type`, so it loads as-is.
const { experience } = await import(pathToFileURL(at('src', 'data', 'experience.ts')).href);
const jobs = [...experience].sort((a, b) => a.order - b.order);

const tr = (v, lang) => (typeof v === 'string' ? v : v[lang]);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// "2025-08" -> "Aug 2025" (EN) / "Ago 2025" (ES)
const month = (ym, lang) => {
  const [y, m] = ym.split('-').map(Number);
  const text = new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace('.', '');
  // Same capitalisation as the site (formatMonth in src/lib/content.ts): "Aug 2025", "Ago 2025".
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const period = (j, lang) =>
  `${month(j.start, lang)} – ${!j.end || j.end === 'present' ? cv.present[lang] : month(j.end, lang)}`;

const css = `
  @page { size: 612pt 1008pt; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.4; color: #000; padding: 64pt 72pt 40pt 72pt; }
  h1 { font-size: 16pt; line-height: 1.2; margin: 0 0 6pt; font-weight: 700; }
  p { margin: 0; }
  .contact { margin-bottom: 10pt; }
  h2 { font-size: 11pt; font-weight: 700; margin: 12pt 0 5pt; padding-bottom: 1.5pt; border-bottom: 0.75pt solid #7f7f7f; line-height: 1.3; }
  .job { margin-top: 7pt; }
  .job:first-of-type { margin-top: 0; }
  .org { font-style: italic; margin: 1pt 0 3pt; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding-left: 14pt; text-indent: -9pt; margin: 0 0 2.6pt 0; }
  li::before { content: "- "; }
  .edu p, .skills p { margin: 0 0 4pt; }`;

const render = (lang) => {
  const experience = jobs
    .map((j) => {
      const place = [j.location && tr(j.location, lang), cv.country[lang]].filter(Boolean).join(', ');
      const bullets = j.highlights.map((h) => `<li>${esc(h[lang])}</li>`);
      if (cv.stackLines[j.id]) bullets.push(`<li>${esc(cv.stackLabel[lang])}: ${esc(cv.stackLines[j.id])}.</li>`);
      return [
        '<div class="job">',
        `<p><b>${esc(tr(j.role, lang))}</b> &nbsp;|&nbsp; ${esc(period(j, lang))}</p>`,
        `<p class="org">${esc(tr(j.organization, lang))} – ${esc(place)}</p>`,
        `<ul>${bullets.join('')}</ul>`,
        '</div>',
      ].join('');
    })
    .join('\n');
  const education = cv.education.map((e) => `<p><b>${esc(e[lang].bold)}</b> – ${esc(e[lang].rest)}</p>`).join('');
  const skills = cv.skills.map((s) => `<p><b>${esc(s.label[lang])}:</b> ${s.value[lang]}</p>`).join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(cv.docTitle[lang])}</title><style>${css}</style></head><body>
<h1>${esc(profile.name)}</h1>
<p>${esc(cv.title[lang])}</p>
<p class="contact">${esc(tr(profile.location, lang))} &nbsp;|&nbsp; ${esc(profile.email)} &nbsp;|&nbsp; ${esc(profile.phone)}</p>
<h2>${esc(cv.headings.summary[lang])}</h2><p>${cv.summary[lang]}</p>
<h2>${esc(cv.headings.experience[lang])}</h2>
${experience}
<h2>${esc(cv.headings.education[lang])}</h2>
<div class="edu">${education}</div>
<h2>${esc(cv.headings.skills[lang])}</h2>
<div class="skills">${skills}</div>
</body></html>`;
};

const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

for (const [lang, name] of [
  ['en', 'CV_Leandro_Garcia_-_English.pdf'],
  ['es', 'CV_Leandro_Garcia_-_Espanol.pdf'],
]) {
  const dir = mkdtempSync(join(tmpdir(), 'cv-'));
  const html = join(dir, 'cv.html');
  writeFileSync(html, render(lang));
  execFileSync(
    browser,
    ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${join(dir, 'profile')}`,
      `--print-to-pdf=${at('public', name)}`, `file:///${html.replace(/\\/g, '/')}`],
    { stdio: 'ignore' },
  );
  rmSync(dir, { recursive: true, force: true });
  console.log(`public/${name} written`);
}
