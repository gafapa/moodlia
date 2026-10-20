# MoodlIA Website

Public website and documentation entry point for the MoodlIA ecosystem at `moodlia.com`.

[Status](#status) · [Getting started](#getting-started) · [Usage](#usage) · [Development](#development) · [Security and privacy](#security-and-privacy) · [Documentation](#documentation) · [License](#license)

## Status

Implemented English/Spanish public website. Product pages distinguish available distributions, previews and concepts. A GitHub source push is separate from deploying a new static export.

## Getting started

Use Node.js 22.13 or later and npm 10 or later. Run `npm ci` and `npm run dev` for local development. Build and validate the static export before deployment.

## Usage

### Current scope

- Lead with AI working inside Moodle, then show rubric import,
  teacher-reviewed grading and course reuse. Provide clear entry points by
  task without audience or installation-skill classifications.
- Give every app real installation steps: store and registry links, Moodle
  menu paths, and exact commands.
- Distinguish store installations, manually installed releases, previews and
  source-only tools. Corrector has a public 0.1.45 guide; unpublished local
  features are not advertised. Studio is a concept, not an available product.
- Host MoodlIA Backup Converter at `/tools/backup-converter/`.

The site is static and does not store user data, Moodle credentials, or
analytics data. See `PRODUCT.md` for structure and content rules and
`DESIGN.md` for the visual system.

The portfolio assessment, evidence, value priorities and narrative are recorded
in `docs/portfolio-strategy.md`. Repository count is not the homepage value
proposition. Product families group tools by outcome rather than by dependency.

### Content

Every product fact is in `app/content.ts`, in English and Spanish: summary,
description, requirements, installation and first-use steps, limitations,
documentation links, version, and license. Update it when an app changes or a
release is published. Interface text and page routes are in `app/i18n.ts`; the
bilingual homepage narrative is in `app/cinematic-copy.ts`. The cinematic direction, motion contract and imagery sources are in `docs/cinematic-direction.md`.

| Page | English | Spanish |
| --- | --- | --- |
| Home | `/` | `/es` |
| Apps | `/apps`, `/apps/<slug>` | `/es/apps`, `/es/apps/<slug>` |
| Installation guide | `/install` | `/es/instalar` |
| How it works | `/how-it-works` | `/es/como-funciona` |

Routes of the previous site (`/start`, `/ways/*`, `/products/*`) are exported
as redirects by `tools/export-static.mjs`.

### Content skill offer

The skills entry offers only `design-portable-moodle-content`. Local authoring
does not require a Moodle connection. Publication uses available Moodle tools;
interactive behavior and restored portability require site-specific verification.

For the cinematic homepage's local preview, run `node tools/preview-static.mjs`
after exporting, then open http://127.0.0.1:3102/es/. Current visual and runtime
evidence is described in `docs/cinematic-review.md`.

The later image-led iteration extends this system to interior pages and replaces
small homepage artefacts with original editorial illustrations. See
`docs/editorial-imagery.md` for image provenance, prompts, routes and design choices.

## Development

Requirements:

- Node.js 22.13 or newer.
- npm 10 or newer.

Commands:

```bash
npm install
npm run dev
npm run build
npm run export:static
npm test
npm run check
```

`npm run check` runs linting, the production build, rendered HTML tests, and
Drizzle schema generation. CI also fails on high-severity advisories in
production dependencies and on critical advisories in any dependency; build
tools such as ESLint and Vite never reach the published static site.

The site uses a Vinext and Cloudflare-compatible build. Hosting configuration lives in `.openai/hosting.json`.

`npm run export:static` converts the validated production build into a static
site under `.static-export/` for deployment to the shared Oracle-hosted Nginx
service. Run `npm run build` first.

### Repository preparation review — 20 october 2026

The current source includes the cinematic homepage and task-oriented guide redesign, English/Spanish product content, local imagery and credits, publication verification tooling, and permanent Corrector/Rubrics policies. Design and deployment evidence remains in `.impeccable/`, `.taste-skill/`, and `docs/`; it is not a promise of unmeasured cross-platform behavior. The extension guide still targets the last tagged Corrector ZIP (0.1.45); newer source preparation and store submission materials do not imply a tagged release or store approval.

The publication-time dependency findings in the dated deployment record are historical. Repository preparation subsequently updated the Cloudflare Vite plugin/Wrangler and compatible transitive fixes. Production dependency audit now reports zero findings. Eight high development-tool findings remain through the upstream `braces` chain; no compatible patched release was available, and the suggested framework downgrade was not applied. The existing CI gates remain unchanged: fail on high production findings or critical findings anywhere. Static production output contains no Node build dependencies.

See `docs/workspace-documentation-review-2026-10-20.md` for the cross-project documentation review and its limits.

## Security and privacy

The static site does not store Moodle credentials or course data. Preserve existing general and extension privacy-policy URLs in every redesign and export.

### Permanent extension privacy policies

All site generations preserve the self-contained English policies at `/privacy/corrector.html` and `/privacy/rubrics.html`, linked from the existing `/privacy` and `/es/privacy` pages. The route contract is `config/extension-privacy.json`; documents live in `public/privacy/`. The exporter fails before replacing its output if a required source document is missing or invalid, and copies policy bytes unchanged into the final site. Sitemap and rendered tests protect these routes. DESIGN.md and AGENTS.md make preservation mandatory for future redesigns.

The Corrector document was imported from its 0.1.65 submission materials. The Rubrics document preserves the English policy text in the Rubrics project's existing multilingual website, including its conditional wording about AI features; this does not advertise AI functionality in the current Rubrics release. Policy content is now versioned within this repository and does not depend on sibling repositories during builds. Changes to extension behavior require corresponding policy updates without changing these public URLs. The policies were published with the website on 20 October 2026; see `docs/publication-2026-10-20.md`. A later repository push is separate from deploying a changed export.

## Documentation

- [Project Pages](https://gafapa.github.io/moodlia/)

Build the repository documentation portal with `python tools/build-project-page.py`. Its status comes from this README; purpose and first steps are maintained in `docs/project-page.json`. The `pages.yml` workflow publishes the portal without deploying the application or changing `moodlia.com`.

Public entry point for the MoodlIA projects, product guides and permanent extension policies.

- [Source code](https://github.com/gafapa/moodlia)
- [Issue tracker](https://github.com/gafapa/moodlia/issues)
- [MoodlIA website](https://moodlia.com)
- [PRODUCT.md](PRODUCT.md)
- [DESIGN.md](DESIGN.md)
- [docs/readme-guidelines.md](docs/readme-guidelines.md)
- [Project Pages directory and publishing](docs/project-pages.md)
- [docs/workspace-documentation-review-2026-10-20.md](docs/workspace-documentation-review-2026-10-20.md)

## License

Copyright (C) 2026 Pablo Gallego.

This project is free software released under the GNU General Public License version 3 or later. See `LICENSE`.
