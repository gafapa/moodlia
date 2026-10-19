# Image-led website review

## Scope

The accepted cinematic homepage now uses three original editorial illustrations. The directory, eleven tool guides, installation and connection explanation have image-led compositions, consistent navigation and readable installation disclosures in Spanish and English. Legal pages inherit the shared interior styling. Illustrations depict teaching materials rather than product screens or evidence of execution. Asset provenance and the generation prompt set are recorded in `editorial-imagery.md`.

## Verification

- Production build, thirteen rendered-HTML tests and static export passed after the final implementation changes.
- ESLint passed with no warnings or errors.
- Fifty-six interior route/viewport scenarios covered fourteen routes, two locales and 1440/390-pixel widths. No document overflow, broken images or page errors were found. Product guides retained three workflow phases and operable installation disclosures; the installation index retained all eleven tools.
- All 368 sampled hover states passed the 4.5:1 text-contrast threshold in light and dark system preferences. The minimum measured homepage ratio was 6.285:1; sampled interior minima were above 10:1. This checks the selected controls, not every possible rendered pixel or full accessibility conformance.
- Directory navigation, a product destination and locale switching passed. Native installation disclosures opened and closed.
- Four homepage modes passed: animated desktop, static phone, reduced motion and JavaScript disabled. All five chapter destinations remained available and the illustrations decoded.
- Fourteen code-layout scenarios covered seven command-bearing product guides at two widths. Copy controls occupy a separate row and do not overlay commands; long commands retain horizontal scrolling inside their own blocks.
- The final homepage inspector reported zero failures and two warnings: ten type sizes and no footage. Type sizes serve the poster, reading and instruction hierarchies. The visitor-driven illustrated sequence is the chosen motion treatment; unrelated autoplay footage was not added.
- Final desktop, tablet and phone page captures, all four interior contact sheets, three scene sheets and the final mobile command capture were visually reviewed. The headless animation sample had a 16.7 ms median frame interval with no sampled intervals above 34 ms. This is local browser evidence, not real-device performance qualification.

Evidence: `.taste-skill/interior-review/browser.json`, `hover.json`, `mobile-code-final.png`, `sheet-*.jpg`, `.taste-skill/image-home-verified/report.json` and page captures, and `.taste-skill/image-scenes-verified/` scene sheets.

## Visual critique

ROUND 3
Seen in one second: a mint teaching poster with a large paper lesson, followed by image-led chapters and clear tool destinations.
Idea (one sentence): teaching materials become a Moodle course, assessment, feedback, follow-up and reusable content.
Live thing: task selection returns real setup destinations; chapter navigation, locale switching and installation disclosures work.
Layout words by section: hero=poster-and-image / argument=split / journey=changing-stage / start=selector / trust=columns / directory=index / product=illustrated-guide / installation=disclosures / connection=map / close=poster.
Scores: design 6.5 · usability 8.5 · creativity 7 · content 8.5 → overall 7.3 after caps.
Caps applied: the Taste Skill's four-real-picture rule caps design at 6.5 because there are three generated editorial illustrations rather than four documentary photographs. Creativity is capped at 7 by the competitor test. This is a subjective implementation review, not an external rating; it remains below the skill's 7.5 target under those rules.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. The same illustration recurs across related chapters (`.taste-skill/image-scenes-verified/workflow-desktop.jpg`). Different crops and the three subject families establish continuity, but future authentic product recordings would add distinct evidence for each tool.
2. Several product headers share the same family illustration (`.taste-skill/interior-review/sheet-es-1440.jpg`). Tool-specific workflow steps distinguish the guides; real product captures would further distinguish their interfaces without implying that the current illustrations are screenshots.
3. The phone opening remains typography-first (`.taste-skill/image-home-verified/mobile-fold.jpg`). Its lesson illustration enters directly below the primary action, preserving readable text and a clear first step rather than squeezing the composition.

## Delivery boundary

The reviewed result is the local static export at `http://127.0.0.1:3102/`. No publication, production deployment, real Moodle mutation, student-data transfer or release qualification was performed. Existing dependency observations from the preceding iteration remain recorded in `cinematic-review.md`.
