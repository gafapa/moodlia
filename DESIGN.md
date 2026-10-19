# MoodlIA design system

## Homepage: a teaching idea becomes a course

The homepage uses the **Loud and flat** direction from Taste Skill (seed 1143788785), with GSAP ScrollTrigger Storytelling for its central sequence. It supersedes the connected-network and static portfolio homepage proposals. See `docs/cinematic-direction.md` for the argument, copy deck, scene ledger and source credits.

On the opening mint poster, a teacher's energy lesson is the material of the design. The same lesson becomes sections and activities, a rubric, reviewed feedback, follow-up signals and reusable course content. All examples are editorial illustrations, not product screenshots or claims of live execution. Product requirements and release readiness remain explicit.

### Visual roles

| Role | Value |
| --- | --- |
| White | `#ffffff` |
| Ink | `#121713` |
| Mint | `#a7ff9c` |
| Orange | `#ff6831` |
| Grey | `#e5e8e1` |
| Typeface | Roundo 400/500/600, locally served WOFF2 |
| Display | Two short authored lines, 12vw desktop, 18vw phone |
| Chapter title | 6.2vw desktop; 50px phone |
| Body | 17–20px, 1.5 leading, generally under 60ch |
| Small | 15px desktop; 13–14px secondary art annotations on phone |
| Page gutter | `clamp(20px, 2.2vw, 48px)` |
| Buttons | Flat ink fill, square corners, white text |

Use whole fields of colour and finished teaching artefacts. No generic icon feature cards, ornamental gradients, resting shadows, tiny uppercase captions or invented app dashboards. The existing MoodlIA logo stays as brand artwork. Native tables retain their grid.

### Motion and accessibility

The central scene pins one viewport and hands off across five labelled GSAP timeline chapters. It uses native scrolling, transform/opacity animation, bounded inner movement and a brief scrub. Only one visible chapter is accessible during the desktop sequence; hidden chapters are inert. MatchMedia/context cleanup restores all content and removes pin spacers.

The animated scene requires at least 1000px width and 740px height. Phones, tablets, short windows, reduced motion and no JavaScript receive a normal vertical story. A user-operated reading-mode control also removes motion. The task selector has native radio buttons and real guide destinations, with a no-script starting link. Preserve semantic landmarks, a keyboard-visible skip link, focus indicators, native FAQ disclosure, Spanish/English parity and metadata.

The homepage uses an intentionally fixed light palette; its black chapter is an authored scene. Interior pages use the same fixed light palette with neutral reading surfaces. CSS is scoped through `.cinematic-home` and `body:has(.cinematic-home)` so guides remain readable.

### Ownership and sources

- `app/home.tsx`: server-rendered composition and metadata.
- `app/cinematic-copy.ts`: bilingual narrative and public product limits.
- `app/course-art.tsx`: authored teaching artefacts.
- `app/story-motion.tsx`: progressive GSAP enhancement and reading-mode control.
- `app/starting-point.tsx`: task selector.
- `app/cinematic.css`: homepage-only tokens and layout.
- `app/editorial-art.tsx`: current reusable illustrations and per-tool workflow labels; asset provenance is in `docs/editorial-imagery.md`.

Current generated illustrations and retained historical imagery are documented in `docs/editorial-imagery.md`. Their role is editorial explanation, not evidence of a software execution.

## Directory and guide pages (current editorial system)

The directory, eleven tool guides, installation, explanation and legal routes now share the Roundo typography and fixed light poster palette. `app/editorial.css` provides neutral reading surfaces, large image-led headers, semantic status labels, native installation disclosures, a concise per-tool workflow and a useful setup sidebar. Header/footer and hover states use explicit high-contrast colours in either system colour scheme.

Three original generated editorial illustrations replace the small teaching artefacts in the homepage and appear in relevant interior contexts. They show teaching materials, never a fake application screen. Asset provenance, prompts, public paths and ownership are in `docs/editorial-imagery.md`. The earlier Wikimedia lesson photographs are retained as source history but no longer used in the current page.

The `.impeccable/design.json` base values record the historical guide system; its editorial extensions point to the current styles and authority. Current route and image evidence is in `.taste-skill/interior-review/`.

## Validation

Build, content tests and static export are necessary but do not establish visual quality. Inspect the rendered result at desktop, tablet, phone and the user's wide viewport; check every story chapter, no-JS/reduced-motion alternatives, live preference/viewport changes, reading-mode cleanup, task destinations and language navigation. Current evidence is under `.taste-skill/`; no production deployment is implied.



## Permanent privacy URLs — redesign invariant

Privacy-policy URLs are public contracts used by extension-store listings and must survive every redesign, new site generation, route reorganization, and static export. A visual redesign must not remove, rename, version, translate, or repurpose these URLs:

- `/privacy` and `/es/privacy`: existing general website privacy pages and extension-policy index links.
- `/privacy/corrector.html`: the complete MoodlIA Corrector extension privacy policy.
- `/privacy/rubrics.html`: the MoodlIA Rubrics / Rubricando for Moodle privacy policy.

The extension pages are self-contained English documents owned by `public/privacy/`. Their canonical URLs and source files are registered in `config/extension-privacy.json`. Keep them independent of homepage composition, app slugs, visual assets, JavaScript, and fonts so a new visual system cannot break store review links. The public privacy pages must retain visible links to both extension policies.

Never silently relocate or replace a policy with an app landing page, login, download, or generic privacy summary. If a future migration introduces another address, keep the established address serving the relevant policy or a permanent redirect to its exact successor. Preserve the policy content and disclosures when changing presentation.

The static exporter validates the route contract before replacing an export, copies both documents unchanged, verifies their bytes, and requires their sitemap entries. Rendered tests protect the fixed paths and index links. Run `npm test` and `npm run export:static` before delivering any redesign or regenerated site; a missing policy is a build failure, not a deferred publishing task.
