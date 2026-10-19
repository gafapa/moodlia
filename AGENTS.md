# Project rules

- Write documentation, code identifiers, and comments in English. Product-facing bilingual copy follows the existing English/Spanish convention.
- Preserve existing work and the visual system recorded in DESIGN.md.
- Privacy policy URLs are permanent external contracts. Every redesign and site generation must preserve `/privacy`, `/es/privacy`, `/privacy/corrector.html`, and `/privacy/rubrics.html`.
- Keep the self-contained policy documents in `public/privacy/`, the route contract in `config/extension-privacy.json`, sitemap entries, and visible links from the general privacy pages.
- Do not rename, version, translate, repurpose, or remove established privacy URLs. If migration is unavoidable, retain the old address as the actual policy or a permanent redirect to its exact successor.
- Validate policy preservation with `npm test` and `npm run export:static`. See the permanent-privacy section of DESIGN.md for the complete design invariant.
