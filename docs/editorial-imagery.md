# Editorial imagery and interior pages

## Decision

The user accepted the cinematic direction but asked for more imagery and designed interior pages. Keep the same Loud and flat direction (seed 1143788785), palette and teaching-journey concept. Replace small code-drawn artefacts with substantial editorial illustrations, and carry the typography, palette and navigation into the directory, eleven product guides, installation, explanation and legal pages.

The illustrations depict teaching materials. They do not represent actual application screens, users, student evidence, installations or execution results. Product facts, public distribution status, installation commands and teacher-review boundaries remain in `app/content.ts`.

## Assets and provenance

Generated with the built-in `image_gen` tool. No CLI/API fallback was used. Original outputs were copied into the workspace before integration. All three generated images were visually inspected; no text, logos or fake software interfaces are embedded.

| Subject | Original | Served JPEG |
| --- | --- | --- |
| Teaching workshop | `assets/generated/teaching-workshop.png` | `public/images/editorial/teaching-workshop.jpg` |
| Assessment workshop | `assets/generated/assessment-workshop.png` | `public/images/editorial/assessment-workshop.jpg` |
| Course reuse | `assets/generated/course-reuse.png` | `public/images/editorial/course-reuse.jpg` |

The JPEGs retain the generated 1536×1024 composition at quality 88; combined transfer size is approximately 929 KiB. Images below the first screen are lazy-loaded and repeated assets reuse the browser cache. Originals remain outside the public asset tree. Earlier Wikimedia lesson photographs are no longer used in the current homepage; their historical source files and credits are retained, without displaying irrelevant credits on the current page.

## Prompt set

Shared constraints: landscape 3:2; tactile thick matte white paper; mint `#a7ff9c`, orange `#ff6831`, graphite `#121713`; substantial physical objects, gentle photographic shadows, controlled diagonals, premium editorial craft. No text, letters, numbers, logos, watermarks, computers, glass, floating SaaS cards or fake application interfaces.

Teaching prompt: a teacher's idea becomes a complete course. A small orange folded-paper spark, an open workbook with classroom energy diagrams and solar-panel photograph, white course sheets, a mint rubric grid, an orange pencil on a feedback card and reusable folders. One coherent composition on a mint studio surface. The workbook is the focal point; objects have plausible physical scale and hand-crafted detail.

Assessment prompt: use the teaching image as a style reference only. A generous paper rubric matrix with graphite plant growth stages, an illustrated energy project sheet, an orange pencil marking a thoughtful correction on a feedback sheet, a mint bookmark and speech bubbles on an orange card. Emphasize meaningful assessment and human review with close framing.

Reuse prompt: use the teaching image as a style reference only. Two substantial open course folders, one holding energy lesson sheets and one receiving matching sheets, connected by one curved orange paper strip. Three illustrated index cards, a graphite key on a mint card for authorized access and a bound workbook. Convey continuity and preservation of the teacher's work, with all objects resting plausibly.

## Page architecture

- Homepage: large illustrations now lead all five animated chapters; its teaching story and motion alternatives remain.
- Directory: image-led opening, task navigation and four visual families. Actual tools remain clearly labeled by readiness and setup knowledge.
- Product guides: large product-family illustration, short product name, requirements/readiness, real install action and a product-specific three-part workflow. Installation groups use native disclosures; the sidebar remains a useful setup reference.
- Installation: image-led introduction, thumbnails and per-tool native disclosures. Rubrics is the initially open low-friction route. Every command and distribution destination remains in the document.
- How it works: a visual connection map distinguishes standard Core services from the plugin route. Provider data-flow language explicitly distinguishes local converters from AI work that reaches the selected provider.
- Shared chrome/legal: Roundo, flat neutral reading surfaces and the same header/footer identity. The editorial palette stays fixed in system dark mode so inherited dark variables cannot produce unreadable hover states.

## Hover correction

The selected task label previously used white text over a light hover fill (contrast 1.08:1). Selected labels now keep a dark fill; all four selected options measure 11.94:1 on hover. The header previously inherited the dark-system tint while retaining dark text (1.32:1). The homepage now explicitly defines its tint. The post-fix audit checked 41 visible controls in each system colour scheme, with no failures and a minimum text contrast of 6.29:1. Evidence: `.taste-skill/hover-verification.json`.

## Source ownership

`app/editorial-art.tsx` owns the reusable imagery and per-tool workflow labels. `app/editorial.css` owns the interior-page reading system and large homepage imagery. Existing `app/cinematic.css` owns the accepted poster composition and corrected task hover. `app/story-motion.tsx` drives the image sequence, with native scrolling and responsive/reduced-motion alternatives. No publication is authorized.
