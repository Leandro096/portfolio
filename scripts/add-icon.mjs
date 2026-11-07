import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { getIconData } from "@iconify/utils";

const require = createRequire(import.meta.url);
const target = new URL(
  "../src/components/iconify/icon-sets.ts",
  import.meta.url,
);
const names = process.argv.slice(2);

if (!names.length) {
  console.error(
    "Usage: node scripts/add-icon.mjs <set>:<icon> [...]  (e.g. solar:home-2-linear)",
  );
  process.exit(1);
}

let file = readFileSync(target, "utf8");
const eol = file.includes("\r\n") ? "\r\n" : "\n";
const collections = {};
let added = 0;

for (const name of names) {
  const [prefix, icon] = name.split(":");
  const key = JSON.stringify(name);

  if (!icon) {
    console.error(`Skipped "${name}": expected <set>:<icon>`);
    continue;
  }
  if (file.includes(`  ${key}:`)) {
    console.log(`Already registered: ${name}`);
    continue;
  }

  try {
    collections[prefix] ??= require(`@iconify-json/${prefix}/icons.json`);
  } catch {
    console.error(
      `Skipped "${name}": package @iconify-json/${prefix} is not installed`,
    );
    continue;
  }

  const data = getIconData(collections[prefix], icon);
  if (!data) {
    console.error(`Skipped "${name}": icon not found in ${prefix}`);
    continue;
  }

  const marker = new RegExp(`(\\* @set ${prefix}\\r?\\n\\s*\\*/\\r?\\n)`);
  if (!marker.test(file)) {
    console.error(
      `Skipped "${name}": no "@set ${prefix}" block in icon-sets.ts`,
    );
    continue;
  }

  const { body, width, height } = data;
  const size =
    (width && width !== 24) || (height && height !== 24)
      ? `, width: ${width}, height: ${height}`
      : "";
  file = file.replace(
    marker,
    `$1  ${key}: { body: ${JSON.stringify(body)}${size} },${eol}`,
  );
  added++;
  console.log(`Added: ${name}`);
}

if (added) writeFileSync(target, file);
