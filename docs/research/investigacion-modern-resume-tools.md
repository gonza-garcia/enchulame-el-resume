# Modern CV / Resume Tooling — Research Findings

> **Date:** July 30, 2026
> **Method:** Primary-source web research (official sites, GitHub repos, docs). Star counts and "last updated" dates are as reported by GitHub on the date above. Where something could not be verified, it is explicitly flagged.

---

## TL;DR — The Landscape (verified, July 2026)

| Rank (stars) | Tool | Type | Stack | Output | ATS-friendly? |
|---|---|---|---|---|---|
| 39.9k | **Reactive Resume** | Full web builder (self-hostable) | TanStack Start / React 19 | PDF, JSON, DOCX | DOCX export helps; not explicitly claimed |
| 27.9k | **Resume-Matcher** | AI resume + JD-match harness | Python + Next.js | PDF, cover letters | Yes (ATS topic + parser) |
| 17.2k | **RenderCV** | "Resume as YAML" CLI | Python + **Typst** | PDF (text-based) | Yes (Typst = real text) |
| 8.8k | **OpenResume** | Local-only web builder | Next.js 13 + React | PDF | **Yes, explicitly** (Greenhouse/Lever) + parser |
| 5.0k | **HugoBlox academic-cv** | SSG theme (Hugo) | Hugo | HTML site + PDF | Site is HTML (ATS-readable) |
| 4.8k | **LapisCV** | Markdown → PDF theme | CSS + Markdown | PDF (via Typora/VSCode/Obsidian) | Yes (text-based PDF) |
| 2.3k | **modern-resume-theme** | SSG theme (Jekyll) | Jekyll + GitHub Pages | HTML site | Site is HTML (ATS-readable) |
| 1.5k | **yamlresume** | "Resume as YAML" (PPResume) | TypeScript | PDF (LaTeX/Typst) | Yes (text-based PDF) |
| 1.9k | **JadeAI** | AI builder, 50+ templates | TypeScript | PDF, image | Claimed ATS-friendly |
| 1.0k | **oh-my-cv** | In-browser Markdown builder | TypeScript | PDF | Yes (text-based) |
| 569 | **atsresume** | Next.js builder (JSON Resume) | Next.js | PDF + site | **Yes, by name/intent** |
| 549 | **Resumed** | Lightweight JSON Resume CLI | TypeScript (ESM) | HTML/PDF | Depends on theme |
| 16.5k | **best-resume-ever** | (Legacy) Vue builder | Vue + LESS | PDF | Older, less maintained |
| 28.2k | **Awesome-CV** | LaTeX template | LaTeX (TeX) | PDF | Text-based; some ATS caveats |
| 4.7k | **resume-cli** (JSON Resume) | Official CLI (archived → monorepo) | Node | HTML/PDF | Depends on theme |

**Big picture:** HTML is now the **#1 language** tagged on GitHub's `resume` topic (5,064 of 13,613 repos), ahead of JavaScript, TypeScript and TeX — confirming that "write a resume in HTML/CSS and print/export to PDF" is now mainstream, not a niche hack. The dominant 2024–2026 trends are: **(a)** "resume as code" (YAML/JSON + CLI), **(b)** privacy-first **local-only** web builders, and **(c)** **AI-assisted** resume tailoring (the fastest-growing sub-category).

---

## 1. HTML/CSS-based resume approaches

### Is writing a resume as a single HTML file and printing to PDF now common?

**Yes.** Three independent signals confirm it:

1. **GitHub topic counts:** On the `resume` topic (13,613 repos total), **HTML is the most-used language (5,064 repos)**, ahead of JavaScript (1,511), TypeScript (1,211), TeX (1,087) and CSS (972). A large share of those HTML repos are single-file `resume.html`/`index.html` templates. ([source: github.com/topics/resume](https://github.com/topics/resume))

2. **JSON Resume's official theme registry** — 400+ npm themes, almost all of which are HTML/CSS (Pug, Handlebars, EJS) rendered server-side and exported to PDF via Puppeteer/`wkhtmltopdf`. The hosted registry lets you preview any theme on a live URL, e.g. `https://registry.jsonresume.org/thomasdavis?theme=flat`. ([source: jsonresume.org/themes](https://jsonresume.org/themes/))

3. **Bundled "Markdown → styled HTML → PDF" themes** like **LapisCV** (4.8k★, see §4) prove the pattern is now productized for non-devs: edit Markdown, get a print-stylesheet, export PDF from Typora/VSCode/Obsidian.

### Pros vs traditional Word/PDF

| | HTML/CSS resume | Word | Pre-made PDF |
|---|---|---|---|
| Version control | ✅ Plain text, diffable in Git | ❌ Binary, painful diffs | ❌ Binary |
| Reusability | ✅ One source → web + PDF | ⚠️ Web export is clunky | ❌ Static |
| Typography control | ✅ Full CSS (fonts, grid, columns, @page) | ⚠️ Limited | ⚠️ Fixed |
| ATS-friendliness | ✅ Text-based PDF when printed via Chromium | ✅ Native | ⚠️ Depends how it was made |
| Non-technical collaboration | ❌ Needs dev | ✅ Universal | ✅ Universal |
| Multi-format export | ✅ HTML/PDF/DOCX via tools | ✅ Native | ❌ Locked |
| Print fidelity | ✅ Pixel-perfect via `@media print` + `@page` | ⚠️ Renderer-dependent | ✅ Fixed |

### Key practical patterns
- **`@media print` + `@page`** CSS for margins, page size (A4/Letter), and page breaks (`break-before: page`).
- **Single-file convention:** inline `<style>` + self-contained HTML so it opens anywhere and prints identically.
- **Print to PDF** via browser (Chromium gives the most consistent output) or Puppeteer/Playwright for automation.
- **ATS note:** a browser-printed HTML PDF is **text-based** (real selectable text), so ATS parsers read it fine — *as long as you avoid embedding text as images/SVG `<text>` in non-standard fonts, and avoid multi-column layouts that some ATS re-order incorrectly.*

### Notable single-file / HTML-template repos (verified)
- **LapisCV** (`BingyanStudio/LapisCV`, 4.8k★, MIT) — Markdown + CSS print themes for Typora/VSCode/Obsidian. Effectively an HTML/CSS resume kit. (Detailed in §4.)
- **sadanandpai/resume-builder** (1.2k★, Next.js) — "Build a standard and professional single page resume" — produces a single-page HTML resume. ([source](https://github.com/sadanandpai/resume-builder))
- **best-resume-ever** (`salomonelli/best-resume-ever`, 16.5k★, Vue) — historically the most-starred HTML-template approach; last updated June 2024, so largely **legacy** now. ([source](https://github.com/salomonelli/best-resume-ever))
- The `awesome-resume-for-chinese` list (8.1k★, `dyweb`) curates many **HTML/JS resume templates** if you want a buffet to pick from. ([source](https://github.com/dyweb/awesome-resume-for-chinese))

> **Could not verify:** I did not find a single canonical "the one HTML resume repo" with tens of thousands of stars — the pattern is **distributed** across thousands of personal `resume.html` repos plus the tools above. The HTML approach is a *technique*, not a single product.

---

## 2. JSON Resume (`jsonresume.org`)

**The open standard for resumes-as-JSON.** A community-driven schema (MIT) defining a `resume.json` structure; an ecosystem of ~400+ community themes renders that JSON to HTML/PDF.

- **Site:** https://jsonresume.org
- **Org:** https://github.com/jsonresume
- **Schema repo:** `jsonresume/resume-schema` (MIT) — schema **v1.0.0**, fields: `basics`, `work`, `volunteer`, `education`, `awards`, `certificates`, `publications`, `skills`, `languages`, `interests`, `references`, `projects`. ([source: jsonresume.org/schema](https://jsonresume.org/schema/))
- **Themes:** 400+ npm packages (`jsonresume-theme-*`); live registry at `registry.jsonresume.org`. Official/curated themes shown on the site include **Tailwind, Even, Flat, Elegant, Kendall, Macchiato, Stack Overflow, Professional, Sidebar, Reference**, plus a large new "JSON Resume Team" set (Desert Modern, Elegant Pink, Academic CV Lite, Bold Header Statement, Architect's Portfolio, Consultant Polished, Creative Studio, Data-Driven, Developer Mono, Executive Slate, Government Standard, Berlin Grid, Brutalist, Art Deco, etc.). ([source](https://jsonresume.org/themes/))
- **How it works:** `resume init` → fill `resume.json`/`resume.yaml` → `resume export resume.html --theme even` (or `--format pdf`). Themes are npm packages; the CLI resolves `--theme <name>` or `resume.meta.theme`.

### CLI status — IMPORTANT change (June 2026)
- **`jsonresume/resume-cli` (4.7k★) was archived on June 12, 2026** and is now **read-only**. ([source: repo banner](https://github.com/jsonresume/resume-cli))
- Active development **moved to the monorepo** `jsonresume/jsonresume.org` under `packages/cli`.
- The **npm package `resume-cli` still works** and has been **"revived for Node 18+"** in 2026 — `npm install -g resume-cli` still installs it, now published from the monorepo. Revival announcement: `jsonresume/jsonresume.org#786`. ([source](https://github.com/jsonresume/resume-cli))
- The old repo's README explicitly recommends the **third-party client `Resumed`** (see §4) as an alternative.

### Pros
- True open standard — your data is portable across any compliant tool.
- Huge theme ecosystem; swap look without re-entering data.
- JSON/YAML is diff-able and CI-friendly (auto-build a PDF on every commit).
- Schema-validated → catches typos before export.

### Cons
- The ecosystem is **fragmented**: many themes are unmaintained hobby projects (maintenance ranking on npm varies wildly).
- The official CLI was neglected for years and only just revived in 2026; momentum has shifted to third-party clients (`Resumed`) and adjacent tools (`yamlresume`, `Reactive Resume` imports JSON Resume).
- PDF export via Puppeteer pulls in a headless Chromium dependency.

### ATS-friendliness
**Depends entirely on the theme.** Themes that render to semantic HTML and print via Chromium produce **text-based, ATS-friendly PDFs**. Two-column/themes with heavy graphics can trip up ATS re-ordering. The `Flat`, `Even`, `Elegant`, `Professional` themes are safe bets.

---

## 3. Reactive Resume / RxResume (`rxresu.me`)

**The most popular open-source resume builder.** A full-featured, privacy-first web app you can use hosted or self-host.

- **Repo:** `AmruthPillai/Reactive-Resume` → **39.9k★**, 4.5k forks, MIT license ([source](https://github.com/AmruthPillai/reactive-resume))
- **Site:** https://rxresu.me · **Docs:** https://docs.rxresu.me
- **Activity:** Updated **Jul 30, 2026** (today, as of research date) — very active. 5,670 commits.
- **Current stack (2026):**
  - Framework: **TanStack Start (React 19, Vite)**
  - Language: TypeScript
  - DB: **PostgreSQL + Drizzle ORM**
  - API: **ORPC** (type-safe RPC)
  - Auth: **Better Auth**
  - Styling: Tailwind CSS + Base UI (shadcn-style)
  - State: Zustand + TanStack Query

### Features (verified from README)
- Real-time preview, drag-and-drop section ordering, custom sections, rich text editor.
- **15 templates** (Pokémon-named: Azurill, Bronzor, Chikorita, Ditto, Gengar, Glalie, Kakuna, Lapras, Leafish, Onyx, Pikachu, Rhyhorn, Ditgar, Meowth, Scizor).
- A4 **and** Letter sizes; customizable colors, fonts, spacing; "Structured Style Rules".
- **Export:** PDF, JSON, DOCX.
- **Import** from JSON Resume format.
- **AI integration** (OpenAI, Google Gemini, Anthropic Claude), multi-language, share via links, dark mode, passkey + 2FA.

### Self-hosting (verified from docs)
- **From v5.1.0 onwards, PDF generation runs entirely client-side via `@react-pdf/renderer`** — new deployments **no longer need Browserless, Chromium, or any external print service**. The old `PRINTER_*` / `BROWSERLESS_*` env vars are obsolete. ([source: docs.rxresu.me/self-hosting/docker](https://docs.rxresu.me/self-hosting/docker))
- **Minimum stack:** just **PostgreSQL** + the app container. Email (SMTP), S3-compatible storage, and Redis (for the AI Agent workspace) are **optional**.
- Minimum requirements: **1 vCPU / 1 GB RAM** (2 GB if Postgres on same host).
- Images: `amruthpillai/reactive-resume:latest` (Docker Hub) or `ghcr.io/amruthpillai/reactive-resume:latest` (GHCR).
- Quickstart is a single `compose.yml` with Postgres + the app; `docker compose up -d` → http://localhost:3000.
- Auto-runs DB migrations on startup; health check at `/api/health`; supports Traefik/Caddy/nginx reverse-proxy health checks.
- Feature flags for private instances (`FLAG_DISABLE_SIGNUPS`, `FLAG_DISABLE_EMAIL_AUTH`, etc.).

### Pros
- By far the most polished full builder; genuinely free, no ads, no tracking by default.
- Real self-hosting story (single Docker command, Postgres-only minimum).
- Privacy: data ownership, one-click delete, full export.
- Modern stack — actively maintained in 2026.

### Cons
- Heavier than CLI-only tools (needs Postgres even self-hosted).
- PDF is rendered client-side in-browser via `@react-pdf/renderer` — very large resumes / extreme memory limits can fail (documented in troubleshooting).
- 15 templates is fewer than the JSON Resume ecosystem's 400+, and they share a "Reactive Resume" family look.

### ATS-friendliness
**Not explicitly claimed.** The **DOCX export** is the ATS-safe path (Word `.docx` is the most ATS-compatible format). The PDF is generated by `@react-pdf/renderer` (text-based, so generally ATS-readable), but two-column visual templates can still confuse some ATS parsers. **For strict ATS use, export DOCX.**

---

## 4. Other notable open-source resume builders

### OpenResume — `xitanggg/open-resume` (8.8k★, AGPL-3.0)
- **Site:** https://open-resume.com · **Repo:** https://github.com/xitanggg/open-resume
- 1.0k forks, **36 commits only**, last updated **Oct 29, 2024** — feature-complete but **low recent activity**.
- **Stack:** Next.js 13, React, Redux Toolkit, Tailwind, **`react-pdf`** (renderer), **PDF.js** (parser).
- **What it does:** A **local-only** resume builder + a **resume parser**. Runs entirely in your browser — **no sign-up, no data leaves the browser** (still works offline).
- **Five core features:** (1) real-time UI update, (2) modern professional design that is **explicitly ATS-friendly to Greenhouse and Lever** (auto-formats fonts/margins/bullets to US best practices), (3) privacy (local-only), (4) **import from an existing resume PDF** (parse-and-rebuild in seconds), (5) "successful track record" — users report offers from Dropbox, Google, Meta.
- **Resume parser** is a second tool: upload a PDF to test its ATS readability (uses PDF.js → custom AST algorithm).
- **Pros:** Best ATS story of any tool here; fully offline; one design, done well.
- **Cons:** **AGPL-3.0** (copyleft — restrictive for derivative commercial use); only one design; little activity since late 2024; US-centric.

### RenderCV — `rendercv/rendercv` (17.2k★, MIT)
- **Site:** https://rendercv.com · **Docs:** https://docs.rendercv.com · **Repo:** https://github.com/rendercv/rendercv
- 1.3k forks, 1,961 commits, last updated **May 1, 2026** — active.
- **Stack:** Python 3.12+, **Typst** (modern LaTeX replacement) for PDF rendering, Pydantic for validation, JSON Schema for editor autocompletion.
- **What it does:** "Resume as code" for academics & engineers. Write your CV as **YAML**, run `rendercv render CV.yaml`, get a **PDF with perfect typography**. Ships a **JSON Schema** for VS Code autocompletion + inline docs, **strict validation** (tells you exactly what/where is wrong), **locale/i18n** support, and an **AI agent skill** (`npx skills add rendercv/rendercv-skill` — works with any agent supporting skills.sh; auto-generated from source and evaluated with promptfoo).
- **9 built-in themes:** Classic, Engineeringresumes, Sb2nov, Moderncv, Engineeringclassic, Harvard, Ink, Opal, Ember. Extensive design options (page size, margins, colors per element, typography, line spacing, alignment, fonts).
- **Pros:** Typst gives **real, selectable, ATS-friendly text** (not image); version-control-friendly; great for academics; excellent DX (schema + validation).
- **Cons:** Python toolchain; Typst is newer than LaTeX (smaller template community); not a web app — CLI-first.
- **ATS:** ✅ Typst outputs text-based PDF → ATS-friendly.

### Resumed — `rbardini/resumed` (549★, MIT)
- **Repo:** https://github.com/rbardini/resumed · npm: `resumed`
- 36 forks, 34 commits, **100% code coverage**, pure ESM, ~180 LOC.
- **What it does:** The **officially-recommended lightweight alternative to `resume-cli`**. A complete reimplementation of the JSON Resume CLI in modern tech: `render`, `export` (PDF via Puppeteer), `init`, `validate`. CLI + fully-typed Node.js API.
- **Key difference from `resume-cli`:** does **not** bundle a default theme — you `npm install` a `jsonresume-theme-*` package and pass `--theme`. Async render support.
- **Pros:** Tiny, modern, typed, programmable. **Cons:** No local preview server, no YAML support (by design).
- **ATS:** Depends on theme.

### Resume-Matcher — `srbhr/Resume-Matcher` (27.9k★)
- **Repo:** https://github.com/srbhr/Resume-Matcher
- Updated **Jul 30, 2026** — very active. Stack: Python + Next.js/TypeScript.
- **What it does:** **AI harness** for building resumes, PDFs, cover letters — runs **locally** with **100+ LLMs** support. Strong ATS angle (resume parser + JD matching + vector search/word embeddings).
- **Pros:** The leading "AI + ATS" tool; local/private; huge LLM support.
- **Cons:** More of an *assistant/matcher* than a pure builder; heavier setup.
- **ATS:** ✅ Explicitly ATS-focused (topic: `ats`, `applicant-tracking-system`).

### yamlresume — `yamlresume/yamlresume` (1.5k★, TypeScript)
- **Repo:** https://github.com/yamlresume/yamlresume · Updated **Jul 22, 2026**
- **What it does:** "Resumes as code in YAML, brought to you by PPResume." Uses LaTeX/Typst under the hood; JSON-Resume-compatible.
- **Pros:** Familiar YAML-as-code workflow; active. **Cons:** Smaller community than RenderCV.
- **ATS:** ✅ Text-based PDF.

### JadeAI — `LingyiChen-AI/JadeAI` (1.9k★, TypeScript)
- **Repo:** https://github.com/LingyiChen-AI/JadeAI · Updated **Jul 2, 2026**
- **What it does:** AI-powered smart resume builder — **50+ professional templates**, PDF/image parsing, AI optimization, **JD match analysis**, multi-format export. One-click Docker deployment.
- **Pros:** Template breadth + AI + Docker ease. **Cons:** Newer project.
- **ATS:** Claimed ATS-friendly (awesome-cv lineage).

### LapisCV — `BingyanStudio/LapisCV` (4.8k★, MIT)
- **Repo:** https://github.com/BingyanStudio/LapisCV · Updated **Jul 16, 2026**
- 304 forks, 61 commits. **Site:** https://lapis-cv.bingyan.net
- **What it does:** Create a resume with **Markdown** in **VSCode / Typora / Obsidian**, export to PDF using bundled CSS print themes. v2.0.0 adds a **Serif** variant. Ships custom icon glyphs, page-break (`---`), and customizable CSS variables (font sizes, colors, margins).
- **Workflow:** drop `lapis-cv.css` into Typora's theme folder, or use the Markdown-PDF VSCode extension, or open as an Obsidian vault → `File > Export > PDF`.
- **Pros:** Uses editors people already know; Markdown is diff-friendly; beautiful defaults; great for the "HTML/CSS resume" crowd who want zero build step.
- **Cons:** Chinese-origin project (docs bilingual EN/中文); tied to specific editors' PDF engines (Typora/Chromium-based, VSCode/`markdown-pdf`/Puppeteer, Obsidian).
- **ATS:** ✅ Text-based PDF (Chromium/Puppeteer render).

### ResuLLMe — `IvanIsCoding/ResuLLMe` (472★, Jinja)
- **Repo:** https://github.com/IvanIsCoding/ResuLLMe · Updated **Jul 17, 2026**
- **What it does:** "Enhance your résumé with Large Language Models" — JSON Resume + LaTeX template + Streamlit UI + resume parser. Niche but actively maintained.

### oh-my-cv — `Renovamen/oh-my-cv` (1.0k★, TypeScript)
- **Repo:** https://github.com/Renovamen/oh-my-cv · Updated **Jul 11, 2024**
- **What it does:** An **in-browser, local-first Markdown resume builder**. Edit Markdown, preview live, export PDF — no server.
- **ATS:** ✅ Text-based PDF.

### atsresume — `sauravhathi/atsresume` (569★, JavaScript/Next.js)
- **Repo:** https://github.com/sauravhathi/atsresume · Updated **Mar 31, 2026**
- **What it does:** "Get hired with an ATS-optimized resume." Next.js builder that uses **JSON Resume** as the data format and also builds a **resume website**.
- **ATS:** ✅ By design/name.

### best-resume-ever — `salomonelli/best-resume-ever` (16.5k★, Vue) — **LEGACY**
- **Repo:** https://github.com/salomonelli/best-resume-ever · Last updated **Jun 11, 2024**
- Historically huge (Vue + LESS), now largely unmaintained. Mentioned for completeness; prefer modern alternatives.

### sadanandpai/resume-builder (1.2k★, Next.js)
- Updated **Jul 27, 2026**. "Build a standard and professional single page resume." Good reference for the single-HTML-page resume pattern. ([source](https://github.com/sadanandpai/resume-builder))

---

## 5. Static site generators for resumes

Using an SSG to generate a **resume website** (HTML) that also **exports to PDF** is a well-trodden path. The pattern: one data file (JSON/YAML/Markdown) → SSG builds a styled HTML site → a `@media print` stylesheet + Puppeteer/Playwright step (often in CI) produces a PDF fallback.

### Jekyll
- **modern-resume-theme** — `sproogen/modern-resume-theme` (2.3k★, HTML/Jekyll)
  - Updated **Jun 15, 2024**. "A modern static resume template and theme. Powered by Jekyll and GitHub Pages." The classic "deploy your resume to GitHub Pages" option — free hosting, version-controlled YAML data, auto-rebuild on push. ([source](https://github.com/sproogen/modern-resume-theme))

### Hugo
- **hugo-theme-academic-cv** — `HugoBlox/hugo-theme-academic-cv` (5.0k★, Jupyter Notebook/Hugo)
  - Updated **Jul 26, 2026**. Academic portfolio + CV theme; **AI generates pages, you own as Markdown**. BibTeX auto-import, Jupyter, LaTeX, slides, visual block editor. "Free to host forever" (Netlify/GitHub Pages). Strongest SSG option for **academics** who want a site + a CV from one source. ([source](https://github.com/HugoBlox/hugo-theme-academic-cv))

### Gatsby
- **visiky/resume** (3.2k★, TypeScript/Gatsby)
  - Updated **Aug 30, 2023** — stale. Online resume generator built on Gatsby. Largely superseded by the Next.js/Astro builders. ([source](https://github.com/visiky/resume))

### Astro / Next.js
- **Astro:** The `astro-resume` GitHub topic has only **2 repos** ([source](https://github.com/topics/astro-resume)) — Astro is far more popular for *portfolios + blogs* than for dedicated resume sites. Astro resume usage exists but is **not a consolidated trend**; most "Astro resume" repos are personal portfolio sites that happen to embed a resume page. **No canonical, high-star Astro resume starter could be verified** — I did not invent one.
- **Next.js:** Used as the *engine* inside many builders above (OpenResume, atsresume, Resume-Matcher, JadeAI, sadanandpai/resume-builder), rather than as a "deploy your resume site" template.
- **Eleventy:** I could not verify a high-star, currently-maintained Eleventy resume starter (the `daviddarnes/eleventy-webster` URL returned 404). Eleventy is a natural fit (Markdown → HTML → print) but lacks a dominant resume template.

### SSG + PDF export pattern (recommended recipe)
1. Data in `resume.json` (JSON Resume schema) or `resume.yaml` (RenderCV/yamlresume).
2. SSG builds `index.html` with a `@media print` stylesheet (`@page { size: A4; margin: 15mm; }`, `break-before: page` per section).
3. CI step uses **Playwright** or **Puppeteer** to print `index.html` → `resume.pdf` on every push.
4. Deploy HTML to GitHub Pages/Vercel/Netlify; attach the PDF as a release asset or `/resume.pdf` route.

---

## 6. The "developer portfolio + resume" trend

### Is a live web resume + PDF fallback now expected for devs?

**Verification is partial — I could not find a single authoritative 2024–2026 survey with a hard %, so treat the following as well-grounded observation, not a measured statistic.**

What is **verifiable** from the data:

- **GitHub portfolio/resume curation repos are extremely popular.** `Evavic44/portfolio-ideas` (6.2k★) curates "awesome portfolio website ideas for developers and designers" and is actively maintained (updated May 2026). ([source](https://github.com/Evavic44/portfolio-ideas))
- **`live-resume`** (`guilhermeborgesbastos/live-resume`, 480★, Angular) markets itself as a "professional **website & resume**" — explicitly built for the "web resume + PDF" dual use case. ([source](https://github.com/guilhermeborgesbastos/live-resume))
- **Builders increasingly bundle a public link + PDF.** Reactive Resume ("Share resumes via unique links"), atsresume (builds a resume *site*), HugoBlox academic-cv (site + CV), modern-resume-theme (GitHub Pages site) all treat the **website** as the primary artifact and the **PDF** as the export. This product convergence is strong evidence the dual format is now the default expectation for tech roles.
- **Job-search guidance repos** (`cassidoo/getting-a-gig`, 7.7k★) and AI job-search tools (`santifer/career-ops` 62.3k★, `MadsLorentzen/ai-job-search` 28.7k★) all assume a web presence + downloadable resume.

### Practical read
- **For software/dev/tech-adjacent roles:** a live web resume (even a simple GitHub Pages site) **is now table-stakes for senior/visible roles and strongly preferred for juniors** — it doubles as a portfolio and a signal you can ship a website. A polished PDF fallback remains mandatory because most ATS pipelines still ingest PDF/DOCX.
- **For non-tech roles:** a live site is a differentiator, not an expectation; a clean ATS-friendly PDF/DOCX is still the primary artifact.
- **The winning pattern (2026):** one structured source (JSON Resume schema or YAML) → renders to **(a)** a website, **(b)** a PDF, and **(c)** a DOCX, from the same data. Tools that do all three from one source (Reactive Resume, atsresume, the JSON Resume + SSG recipe) are the modern ideal.

---

## 7. Recommendations / decision guide

| Your situation | Recommended primary tool | Fallback / export |
|---|---|---|
| Non-technical user, want a polished builder, may self-host | **Reactive Resume** (hosted or Docker) | Export DOCX for ATS |
| Want the **best ATS guarantee** + import existing PDF | **OpenResume** | Its built-in PDF (ATS-tested) |
| Developer who wants "resume as code", perfect typography, version-controlled | **RenderCV** (YAML → Typst PDF) | Text PDF is ATS-friendly |
| Already love Markdown / Obsidian / Typora | **LapisCV** | PDF via editor's print |
| Academic with publications, BibTeX, talks | **HugoBlox academic-cv** (Hugo site + CV) | Print site to PDF |
| Want one data file → website + PDF + DOCX, build in CI | **JSON Resume schema** + an SSG (Astro/Next) + Playwright print step | DOCX via pandoc/Reactive Resume import |
| Want a **lightweight CLI** for JSON Resume | **Resumed** (or revived `resume-cli`) | Any `jsonresume-theme-*` |
| Want AI to tailor per job description | **Resume-Matcher** or **JadeAI** | ATS PDF export |

### Quick ATS rules of thumb (any tool)
1. Prefer **DOCX** when you know the employer uses Workday/Greenhouse/Lever Taleo-style ATS — it's the safest universal format.
2. If shipping **PDF**, ensure it's **text-based** (selectable text) — Typst, Chromium-printed HTML, `@react-pdf/renderer`, and `react-pdf` all qualify; image/SVG-text PDFs do not.
3. Avoid **two-column** layouts for ATS submissions (many parsers re-flow columns left-to-right and scramble order); keep a single-column ATS version and a fancy web version.
4. Avoid embedding text as images or non-standard-font SVG `<text>`.
5. Always run your final PDF through a parser (OpenResume's parser, Resume-Matcher) before submitting.

---

## 8. Sources (all accessed July 30, 2026)

- JSON Resume — https://jsonresume.org , https://jsonresume.org/schema/ , https://jsonresume.org/themes/
- JSON Resume CLI — https://github.com/jsonresume/resume-cli (archived 2026-06-12, moved to monorepo `jsonresume/jsonresume.org`)
- Resumed — https://github.com/rbardini/resumed
- Reactive Resume — https://github.com/AmruthPillai/Reactive-Resume , https://docs.rxresu.me/self-hosting/docker , https://rxresu.me
- OpenResume — https://github.com/xitanggg/open-resume , https://open-resume.com
- RenderCV — https://github.com/rendercv/rendercv , https://rendercv.com , https://docs.rendercv.com
- LapisCV — https://github.com/BingyanStudio/LapisCV , https://lapis-cv.bingyan.net
- Resume-Matcher — https://github.com/srbhr/Resume-Matcher
- yamlresume — https://github.com/yamlresume/yamlresume
- JadeAI — https://github.com/LingyiChen-AI/JadeAI
- oh-my-cv — https://github.com/Renovamen/oh-my-cv
- atsresume — https://github.com/sauravhathi/atsresume
- ResuLLMe — https://github.com/IvanIsCoding/ResuLLMe
- HugoBlox academic-cv — https://github.com/HugoBlox/hugo-theme-academic-cv
- modern-resume-theme (Jekyll) — https://github.com/sproogen/modern-resume-theme
- visiky/resume (Gatsby) — https://github.com/visiky/resume
- sadanandpai/resume-builder — https://github.com/sadanandpai/resume-builder
- best-resume-ever (legacy) — https://github.com/salomonelli/best-resume-ever
- Awesome-CV (LaTeX) — https://github.com/posquit0/Awesome-CV
- GitHub topics — https://github.com/topics/resume , https://github.com/topics/resume-builder , https://github.com/topics/astro-resume
- portfolio-ideas — https://github.com/Evavic44/portfolio-ideas
- live-resume — https://github.com/guilhermeborgesbastos/live-resume

---

## 9. Gaps & honest uncertainties

- **Astro/Eleventy dedicated resume starters:** no high-star, currently-maintained canonical starter could be verified. The pattern exists in personal portfolios but is not consolidated into a flagship repo. I did not fabricate one.
- **Exact 2024–2026 survey data** on what % of devs have a live web resume: not found in a citable primary source. The trend conclusion is inferred from builder features and repo activity, not a measured statistic.
- **Star counts and "updated" dates** are snapshots from GitHub on July 30, 2026 and will drift.
- **RenderCV / yamlresume internals** (exact LaTeX-vs-Typst engine selection per theme) — verified at README level only; deeper claims would require reading the source.
