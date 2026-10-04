# MoodlIA Website

Public website and documentation entry point for the MoodlIA ecosystem at `moodlia.com`.

## Current Scope

- Explain what MoodlIA is and what each app does, for teachers, Moodle
  administrators, and developers.
- Give every app real installation steps: store and registry links, Moodle
  menu paths, and exact commands.
- List only apps with a public release; Corrector, Analyzer Desktop, and Studio
  are not shown.
- Host MoodlIA Backup Converter at `/tools/backup-converter/`.

The site is static and does not store user data, Moodle credentials, or
analytics data. See `PRODUCT.md` for structure and content rules and
`DESIGN.md` for the visual system.

## Content

Every product fact is in `app/content.ts`, in English and Spanish: summary,
description, requirements, installation and first-use steps, limitations,
documentation links, version, and license. Update it when an app changes or a
release is published. Interface text and page routes are in `app/i18n.ts`.

| Page | English | Spanish |
| --- | --- | --- |
| Home | `/` | `/es` |
| Apps | `/apps`, `/apps/<slug>` | `/es/apps`, `/es/apps/<slug>` |
| Installation guide | `/install` | `/es/instalar` |
| How it works | `/how-it-works` | `/es/como-funciona` |

Routes of the previous site (`/start`, `/ways/*`, `/products/*`) are exported
as redirects by `tools/export-static.mjs`.

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
Drizzle schema generation. CI also audits production and development
dependencies for high-severity vulnerabilities.

The site uses a Vinext and Cloudflare-compatible build. Hosting configuration lives in `.openai/hosting.json`.

`npm run export:static` converts the validated production build into a static
site under `.static-export/` for deployment to the shared Oracle-hosted Nginx
service. Run `npm run build` first.

## License

Copyright (C) 2026 Pablo Gallego.

This project is free software released under the GNU General Public License version 3 or later. See `LICENSE`.
