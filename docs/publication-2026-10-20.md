# MoodlIA publication — 20 October 2026

The user explicitly authorized publication to `moodlia.com`. The current static export was published using the existing server-hub public publishing command, `D:\gallego.top\scripts\publish_static_site.ps1`, with the registered domain and management root `D:\Otros IA\gestion_gallego_top`. Credentials were handled by the existing publisher and were not printed or stored in this repository.

The former local staging directory was preserved at `D:\Otros IA\gestion_gallego_top\static-sites\moodlia.com-before-20261020-011610`. The publisher's reviewed server procedure creates a timestamped domain archive under `/opt/docker/backups/static-sites/` before replacing the site. That remote archive was not independently read back in this run. The command reported a successful Nginx configuration test, `domain=moodlia.com` and `container_recreated=false`.

## Validation

- ESLint and the production build passed. An initial installation-link assertion failed transiently; an isolated rerun and the complete subsequent fifteen-test run passed without changing that assertion or its product link. The static export then completed successfully.
- All 157 exported files matched their public HTTPS responses byte for byte by SHA-256. This includes the permanent extension policies, images, fonts, scripts, styles and historical redirect documents.
- Ten clean HTTPS routes responded successfully, including both privacy indexes and the main Spanish product, installation and explanation routes.
- Public browser checks covered both locales at 390 and 1440 pixels. Eight privacy-link clicks opened the expected policy documents. No page errors or document-level horizontal overflow were observed in the checked homepage and directory flows.
- The public homepage was also opened and visually checked in the user's Chrome browser. Captures are `.taste-skill/deployment/public-home.png` and `public-privacy.png`.
- Machine-readable evidence is `.taste-skill/deployment/publication.json` and `browser.json`. Repeat checksum verification with `node tools/verify-publication.mjs`.

## Limits

Plain HTTP connection attempts timed out from this environment. HTTPS publication is verified; HTTP-to-HTTPS redirection is not claimed as verified.

The dependency audit reports two high advisories in production-labelled package dependencies (`sharp` and `source-map-js`). These packages belong to the local framework/build dependency tree; this deployment serves only the static export and does not start that Node application on the public server. This publication does not resolve or certify the build dependency advisories. No repository push or remote CI qualification was performed.

An initial custom deployment command was rejected by automatic tool policy before execution. Publication proceeded through the existing server-hub publisher instead of custom credential-handling commands.
