# Portafolio de Leandro Garcia (Astro)

Sitio estático bilingüe (EN `/` y ES `/es/`). **Los datos están separados de los componentes**:
editas archivos en `src/data/` y la página se genera sola.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # genera /dist
pnpm check      # valida tipos y esquemas
node scripts/make-cv.mjs   # regenera los CV (EN/ES) tras cambiar experiencia, perfil o scripts/cv/cv.json
```

## Antes de publicar
Nada pendiente de contenido. Los CV de `public/` se generan, no se editan a mano (ver abajo).

## Estructura

```
src/
├─ content.config.ts      ← UN solo lugar con el ESQUEMA de todos los datos (campos y tipos)
├─ data/                  ← AQUÍ editas tu contenido
│  ├─ profile.json        (nombre, titular, contacto, WhatsApp, pipeline del hero)
│  ├─ tool-groups.json    (categorías de habilidades)
│  ├─ tools.json          (cada herramienta/habilidad; pertenece a un grupo)
│  ├─ education.json      (estudios y cursos)
│  ├─ experience.ts       (array `experience`: un objeto por trabajo)
│  ├─ projects.ts         (array `projects`: un objeto por proyecto/caso de estudio)
│  └─ types.ts            (tipos de esas entradas; los .ts de datos solo usan `import type`)
├─ i18n/ui.ts            ← textos de la INTERFAZ (botones, títulos de sección) EN/ES, con tipos estrictos
├─ lib/                   ← content.ts (acceso a datos, tipos Profile/Pipeline), assets.ts (rutas con base), format.ts
├─ components/ui/         ← piezas reutilizables sin lógica de datos (Wordmark, DefList, Chips, Metric, FlowDiagram…)
├─ components/sections/   ← secciones de la página (Hero, Projects, Skills, Experience, Contact…)
├─ scripts/               ← JS del navegador (tema, menú, animaciones, pipeline, copiar email); dom.ts = ayudantes comunes
├─ styles/                ← tokens.css (colores, espacio, tipografía, breakpoints), fonts.css, base.css, utilities.css, components.css
├─ assets/fonts/          ← Space Grotesk y JetBrains Mono (latín), alojadas en el proyecto y precargadas
└─ pages/                 ← index.astro (EN) y es/index.astro (ES): ambas renderizan <Home lang=…>
```

Dos mecanismos de traducción a propósito: la **interfaz** vive en `i18n/ui.ts` (código, tipado) y el
**contenido** en `data/*` (JSON y los arrays `.ts`) con `{ "en", "es" }` (datos editables y validados). Ver `docs/ADR/0006-keep-i18n-approach.md`.

## Reglas del contenido
- **Texto traducible** siempre con la misma forma: `{ "en": "…", "es": "…" }`.
- **Nombres propios** (React, Azure DevOps…) pueden ser un string simple: `"name": "React"`.
- **Herramientas se escriben una sola vez** en `tools.json` y se referencian por `id`
  (`"stack": ["react", "typescript"]`). La sección de habilidades, los chips de proyectos y
  los de experiencia salen de esa misma lista.
- `order` (número menor = primero) controla el orden en proyectos, experiencia y educación.
- Fechas: `"YYYY-MM"`; `"end": "present"` muestra *Present / Actualidad*.
- Si un dato no cumple el esquema, **el build falla** y dice qué campo y en qué archivo.

## Recetas

**Agregar una experiencia:** añade un objeto al array de `src/data/experience.ts` (copia uno existente y dale un `id` único).
**Agregar un proyecto:** añade un objeto al array de `src/data/projects.ts` (con `id` único). Todo es opcional salvo
`title`, `organization`, `role`, `summary`: `outcomes`, `metrics` (1 = número grande, 2+ = lista),
`flow` (diagrama de proceso), `links` (botones a demo/repo) y `stack`.
**Agregar una herramienta:** una línea en `tools.json` con su `group`.
**Agregar un grupo de habilidades:** una entrada en `tool-groups.json`.
**Cambiar la animación del hero:** edita `pipeline.stages` en `profile.json` (acepta cualquier cantidad de pasos).

## ¿JSON, YAML o Markdown?
El formato **no cambia nada en los componentes**; el esquema es el mismo.
- `experience.ts` y `projects.ts` son arrays TypeScript que `content.config.ts` entrega a las colecciones con un
  loader en línea, así que **siguen validados con el mismo esquema Zod** (incluido que cada `stack` exista en
  `tools.json`). Solo pueden usar `import type`: `make-cv.mjs` los carga con el type-stripping nativo de Node
  (**Node ≥ 23.6**), que borra los tipos pero no resuelve otros imports.
- `tools.json`, `education.json`, `tool-groups.json`, `profile.json` usan `file()`;
  para pasarlos a YAML basta cambiar la extensión en `src/content.config.ts`
  (`file('src/data/tools.yaml')`).
- Recomendación: **JSON/YAML** mientras todo sea dato corto en dos idiomas;
  **Markdown** solo si más adelante agregas texto largo (artículos, casos de estudio extensos).

## SEO y visibilidad en IA
Todo sale de `profile.json` → `seo` (título, descripción, frase visible, ciudad, nombres alternos, "también descrito como"
y áreas de especialidad) y de los mismos datos de experiencia/proyectos; no hay nada duplicado a mano.
- **Meta tags y JSON-LD** (`WebSite` + `ProfilePage` + `Person`): `Layout.astro` y `lib/seo.ts`. Sin email ni teléfono a propósito.
- **`/robots.txt`**: `pages/robots.txt.ts`; permite explícitamente buscadores y rastreadores de IA (OpenAI, Anthropic, Perplexity, Google…).
- **`/sitemap.xml`**: `pages/sitemap.xml.ts`, con alternates `hreflang` EN/ES.
- **`/llms.txt` y `/llms-full.txt`**: `lib/llms.ts`; resumen y perfil completo en Markdown (EN y ES) generados al compilar.
- Para añadir otra forma de describir tu rol, edita `seo.alsoKnownAs` (aparece en el footer, JSON-LD y `llms.txt`).

## Agregar un tercer idioma
1. `src/i18n/index.ts` → agrégalo en `languages`.
2. `src/i18n/ui.ts` → copia el bloque `es` con el nuevo código.
3. Agrega la clave al `l10n` de `content.config.ts` y la traducción en cada archivo de `data/`
   (el build te señala lo que falte).
4. Crea `src/pages/<codigo>/index.astro` (copia el de `es`) y añádelo a `i18n.locales` en `astro.config.mjs`.

## Despliegue
`pnpm build` genera HTML estático en `dist/`. Funciona en Netlify, Vercel, Cloudflare Pages,
GitHub Pages, etc. (build: `pnpm build`, salida: `dist`).

## Herramientas del proyecto
- `node scripts/make-og.mjs` regenera `public/og.png` y `public/apple-touch-icon.png` (marca de `scripts/og/*.svg`).
- `node scripts/snapshots.mjs .snapshots/<nombre>` captura la página completa (3 anchos × 2 temas × 2 idiomas, más el hero en
  ventana corta) con Chrome/Edge; `--compare <A> <B>` las compara por píxeles. Úsalo antes y después de cada refactor visual
  (necesita `pnpm build` previo; `DIST=<carpeta>` sirve otra compilación).
- `node scripts/make-cv.mjs` regenera los dos CV (`public/CV_Leandro_Garcia_-_English.pdf` y `..._-_Espanol.pdf`) desde una sola fuente:
  la experiencia sale de `src/data/experience.ts` (el mismo array que muestra el sitio), los datos de contacto de `profile.json`
  y el resto (resumen, educación, habilidades) de `scripts/cv/cv.json`. Así fechas, cifras y viñetas coinciden en el CV en inglés,
  el CV en español y el portafolio. Ejecútalo después de cambiar cualquiera de esos archivos.
- Decisiones de arquitectura: `docs/ADR/` y plan de ejecución en `docs/PLAN.md`.
