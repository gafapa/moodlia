# MoodlIA Portable website publication — 20 October 2026

## Product integration

Added the local Moodle installer to the English and Spanish website at `/apps/portable` and `/es/apps/portable`. It is discoverable from the homepage hero and tool links, the create/reuse directory family, installation navigation and local-work explanation. The existing visual system, teaching artwork and responsive guide template are retained.

The guide explains bundled Moodle/PHP/PostgreSQL, first-launch version selection, the optional default-enabled MoodlIA plugin, private teacher credentials and connection files, external assistant configuration and standard `.mbz` course export. Teachers do not need separate Docker, PHP, Python, Node.js or database installations. The computer-group description now covers desktop applications as well as locally started browser apps.

## Download boundaries

The repository has no public GitHub Release at this check. Nonexpired preview artifacts exist for Windows x64, macOS Intel/ARM64 and Linux x64/ARM64. The primary download link goes to the Native packages workflow, with instructions to select a successful run and the artifact matching the computer. Artifacts require GitHub sign-in and expire; see [GitHub's artifact download instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts). These are unsigned previews, not claims of code signing, notarization or clean-machine certification. The website work does not rerun the native installer qualification; its separate evidence remains in the Portable repository.

Artifact IDs and observed availability are recorded in `.taste-skill/portable-installer/installer-artifacts.json`.

## Validation and publication

- `npm run check` passed: lint, build, 16 rendered tests and unchanged empty Drizzle schema. Coverage includes the new guide in both locales, discovery links, preview/download boundaries, platform artifact names, canonical URLs, language alternatives and permanent privacy routes.
- `npm run export:static` passed and includes both new guides and sitemap entries.
- Local and public Chromium checks each passed 24 route/viewport combinations: home, directory, installation and guide in both locales at 1440, 768 and 390 pixels. Installation disclosures open; guide links and preview status are present. No browser errors or document-level horizontal overflow were observed. These checks use reduced motion; the unchanged cinematic animation is not requalified by this feature.
- Desktop guide and phone guide/home captures were opened and inspected. The existing hierarchy and mobile stacking remain intact. Public captures and JSON evidence are retained under `.taste-skill/portable-installer/`.
- All 163 exported files matched public HTTPS responses byte for byte, including the extension privacy documents. Fourteen clean HTTPS routes responded successfully. HTTP-to-HTTPS redirection remains unverified because the plain-HTTP probe timed out.

Published through the existing server-hub publisher for `moodlia.com`. Previous local staging is preserved at `D:\Otros IA\gestion_gallego_top\static-sites\moodlia.com-before-portable-20261020-100820`. The publisher performs its existing remote backup procedure, reported a successful Nginx configuration check and did not recreate the container. The remote backup archive itself was not independently read back. No Moodle student data, grades or native application workspaces were changed.
