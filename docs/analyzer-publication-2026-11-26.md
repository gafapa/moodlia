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

## 0.1.0 installers - same day

After MoodlIA Analyzer 0.1.0 was released on GitHub (installers for Windows
x64, macOS Apple silicon and Intel, and Linux x64, each smoke-checked by the
release workflow, with `SHA256SUMS-0.1.0.txt`), the English and Spanish
analyzer page was republished as a manual installation of version 0.1.0: it
links to the release, gives install steps per system and states that the
installers are not code-signed yet. `npm test` passed all 16 rendered-site
tests; only the analyzer, apps and install pages, their RSC payloads and the
client scripts changed. The static-sites content workflow created
`/opt/docker/backups/static-sites/moodlia.com-20261126T132421Z.tar.gz` and
reported `container_recreated=false`, and `node tools/verify-publication.mjs
https://moodlia.com/` verified all 162 public files byte for byte and ten clean
HTTPS routes.

## 0.2.0 with screenshots - same day

After MoodlIA Analyzer 0.2.0 was released on GitHub (the teacher's pending-work
panel, better adaptation to the window size, installers smoke-checked on the
three systems), the analyzer page was republished for 0.2.0. App pages can now
show screenshots in the page's language; the analyzer page shows six WebP
screenshots per language under `/images/apps/analyzer/<locale>/` (727 KB in
total), made with the analyzer's demonstration site and fictitious students
(`npm run screenshots` in the analyzer repository). `npm test` passed all 17
rendered-site tests, including a new check of the screenshots. The rest of the
pages changed only because the stylesheet was renamed. The static-sites content
workflow created
`/opt/docker/backups/static-sites/moodlia.com-20261126T161406Z.tar.gz` and
reported `container_recreated=false`, and `node tools/verify-publication.mjs
https://moodlia.com/` verified all 174 public files byte for byte and ten clean
HTTPS routes.
