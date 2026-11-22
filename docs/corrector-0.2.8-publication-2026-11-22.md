# Corrector 0.2.8 publication - 22 November 2026

Published the Corrector 0.2.8 app card and privacy policy to `https://moodlia.com`.
The English and Spanish Corrector pages now link to the v0.2.8 GitHub release and
its `moodlia-corrector-0.2.8.zip`, describe evidence file selection and ZIP,
spreadsheet and presentation evidence, and state that **Correct when moving to the
next student** sends each uncorrected student's work. The apps, install and
Rubrics pages changed only where they show the Corrector card or version.

`/privacy/corrector.html` was replaced with the 0.2.8 policy from the extension's
submission materials, keeping the site's canonical link, description and policy
navigation. It now covers version 0.2.8 (last reviewed 22 November 2026),
automatic next-student correction and the ZIP download timing. SHA-256:
`33ea3b7f0311fa8f1581adba6c859b9f707517424c6b1ec20a8386c37588dd58`.

`npm test` passed all 16 rendered-site tests. The export was built in a clean
worktree of `main`; compared with the canonical copy, only the pages above and
their RSC payloads changed, and the secret-marker scan found nothing. The
static-sites content workflow created
`/opt/docker/backups/static-sites/moodlia.com-20261122T190510Z.tar.gz` and
reported `container_recreated=false`. The local canonical copy in the
management workspace was replaced with the same export.

`node tools/verify-publication.mjs https://moodlia.com/` verified all 158 public
files byte for byte and ten clean HTTPS routes. The HTTP redirect probe timed
out, as in earlier publications. This publication does not establish Chrome Web
Store approval of 0.2.8.
