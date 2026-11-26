# MoodlIA Analyzer publication - 26 November 2026

Published the MoodlIA Analyzer app page to `https://moodlia.com`, replacing
MoodlIA Analyzer Web. The earlier analyzers, `moodlia-analyzer-web` and
`moodlia-analyzer-desktop`, are discontinued: their READMEs say so and both
GitHub repositories are archived.

The English and Spanish page moved from `/apps/analyzer-web/` to
`/apps/analyzer/`. It describes the desktop app (Windows, macOS and Linux),
its analyses, its read-only Moodle access with or without the MoodlIA plugin,
and installation from source until the first installers are released (MIT
license). `/apps/analyzer-web/`, `/es/apps/analyzer-web/` and the
`/products/analyzer-web/` and `/products/analyzer-desktop/` addresses are
static redirects to the new page. The home page, apps, install and
how-it-works pages and the FAQ name MoodlIA Analyzer.

`npm test` passed all 16 rendered-site tests. The export was built in a clean
worktree of `main`; compared with the canonical copy, only the pages above,
their RSC payloads, the renamed client script and the redirects changed, and
the secret-marker matches were in files identical to the live site. The
static-sites content workflow created
`/opt/docker/backups/static-sites/moodlia.com-20261126T124756Z.tar.gz` and
reported `container_recreated=false`. The local canonical copy in the
management workspace was replaced with the same export.

`node tools/verify-publication.mjs https://moodlia.com/` verified all 162
public files byte for byte and ten clean HTTPS routes. The HTTP redirect probe
timed out, as in earlier publications.
