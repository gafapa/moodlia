# Cinematic homepage review

## Final evidence

- ESLint: 0 errors and 0 warnings.
- Production build and 13 rendered-HTML tests: pass.
- Static export: complete; served locally at http://127.0.0.1:3102/es/.
- Taste source lint: 0 FAIL, 0 WARN.
- Taste final render inspection: 0 FAIL, 2 WARN (type-size count and no video).
- Scene audit: all scenes ran; desktop, phone and reduced-motion contact sheets inspected. Rough headless timing: median 16.7 ms; 1 of 158 frames over 34 ms. This is not real-device performance qualification.
- Browser interaction checks: 8 scenarios passed (1440x900 ES/EN, 2560x889 ES, 768x1024 ES, 390x844 ES, short 1280x650, reduced motion and JavaScript disabled). No page or asset errors and no document overflow.
- Every chapter's visible guide link was checked at five points in the timeline. Reading-mode cleanup removes pin spacers, inert and aria-hidden; reactivation creates exactly one pin. Live reduced-motion and viewport changes clean up correctly.
- The task selector reaches the correct destinations; native FAQs expand; keyboard skip link transfers focus into main.
- No production deployment, Moodle mutation or AI request was performed.

Reports: `.taste-skill/final/report.json`, `.taste-skill/browser-verification.json`. Visual evidence: `.taste-skill/final/`, `.taste-skill/scenes-verified/`, plus individual wide/English/chapter captures. All final inspector images and all three final scene sheets were opened and reviewed.

## Warning decisions

The 11 measured sizes include the intentionally oversized poster, chapter headings, editorial artefacts, body and secondary captions, plus the retained header/footer. They are hierarchical and readable rather than eleven competing styles. A stricter five-size limit would flatten the teaching artefacts and poster scale.

There is no autoplay or unrelated stock video. The visitor drives the movement of the actual example lesson; four real photographs form its starting material. This is the page's moving picture. The entire narrative has a still alternative.

## Visual critique

ROUND 1
Seen in one second: very large mint typography, but the teaching material arrives too far below the opening fold.
Idea (one sentence): an energy lesson becomes the material of a five-part Moodle tool story.
Live thing: task selector with actual setup destinations.
Layout words by section: hero=poster / argument=split / journey=stage / start=selector / trust=columns / directory=list / faq=disclosure / close=poster.
Scores: design 6.5 · usability 7 · creativity 7 · content 8 → overall 6.0 after caps.
Caps applied: initial inspection failures; no real pictures.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Hero art sits below the fold (`.taste-skill/after/desktop-fold.jpg`): place explanation and lesson together below the title.
2. Argument heading wraps to three lines (`.taste-skill/after/mobile-page-01.jpg`): shorten to a concrete two-line title.
3. Earlier scenes remain geometrically visible behind later panels: set their visibility at timeline boundaries and synchronize accessible state with timeline updates.

ROUND 3
Seen in one second: a confident mint poster saying “De idea a Moodle”, with a specific energy lesson beside the invitation to explore.
Idea (one sentence): a teacher's lesson becomes course structure, criteria, reviewed feedback, follow-up and reusable content as the visitor scrolls.
Live thing: choose a task and receive its real setup route; switch between animated and ordinary reading.
Layout words by section: hero=poster-and-artefact / argument=split / journey=changing-stage / interlude=statement / start=selector / trust=columns / directory=list / faq=disclosure / close=poster.
Scores: design 7.8 · usability 8.0 · creativity 7.0 · content 8.5 → overall 7.8.
Caps applied: creativity limited to 7 by the competitor test; this is an authored treatment of a known teaching workflow. These scores are the implementer's subjective assessment, not an external jury or award.
Top three remaining limitations (most visible first), each with the screenshot it shows in and its implication:
1. The mobile first fold introduces the lesson but does not show the complete artwork (`.taste-skill/final/mobile-fold.jpg`); the action and plain-language offer remain fully visible.
2. The supporting directory and FAQs are quieter than the central sequence (`.taste-skill/final/desktop-page-03.jpg`); this is intentional reading/wayfinding relief rather than another held scene.
3. The chapters use editorial artefacts, not live product recordings (`.taste-skill/scenes-verified/workflow-desktop.jpg`); captions and linked guides keep that boundary explicit.

## Dependency observation

The existing dependency tree reports 13 high advisories. GSAP is not listed as affected in this audit. This redesign does not resolve or qualify the unrelated framework/server dependency advisories. The validated delivery here is the static export, not a production server deployment. The captured audit is `.taste-skill/dependency-audit.json`.

This review records the first cinematic iteration. The subsequent image-led
homepage and interior-page review is in `docs/editorial-review.md`.
