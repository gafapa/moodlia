# MoodlIA Website

Public website and documentation entry point for the MoodlIA ecosystem at `moodlia.com`.

## Current Scope

- Present the active MoodlIA products with clear boundaries.
- Explain the shared safety and portability principles.
- Mark MoodlIA Studio accurately as a concept rather than an available product.
- Provide a foundation for future documentation, downloads, release notes, and integrations.

The first version is intentionally static and does not store user data, Moodle credentials, or analytics data.

## Development

Requirements:

- Node.js 22.13 or newer.
- npm 10 or newer.

Commands:

```bash
npm install
npm run dev
npm run build
npm test
npm run check
```

`npm run check` runs linting, the production build, rendered HTML tests, and
Drizzle schema generation. CI also audits production and development
dependencies for high-severity vulnerabilities.

The site uses a Vinext and Cloudflare-compatible build. Hosting configuration lives in `.openai/hosting.json`.
