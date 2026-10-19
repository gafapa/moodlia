# Cinematic homepage direction

Applied skills: `design-taste-frontend` (Leonxlnx/taste-skill) and `gsap-scrolltrigger-storytelling` (MengTo/Skills).

## Brief and subject inventory

Audience: teachers, administrators and developers. Primary action: find one useful Moodle workflow and reach its actual setup.
Subject-specific material: Moodle course sections; question banks; a teacher's learning intention; spreadsheet rubric criteria; assignment evidence; reviewed feedback; permission-bound tools; a local or approved AI provider; backup archives; a plan/approve/apply/verify reuse workflow.

Idea: on this page, a teacher's energy lesson becomes the material of a changing poster, carried through MoodlIA's course tools, rubric importer, reviewed feedback, follow-up and reuse utilities.

The live interaction is a task selector with real setup destinations. It does not execute Moodle operations or simulate AI output.

## Direction

Taste draw: Loud and flat, seed 1143788785. Grey/mint/orange, Roundo 400/500/600, large short statements, saturated full-field sections and an authored teaching artefact. No redraws. The direction takes precedence over the paper-only hero sub-blueprint: product-specific editorial artefacts accompany the full-width statement. Mountain photographs were not used because they have no connection with the product. The teaching artefacts are authored examples, explicitly captioned, not screenshots or evidence of execution. Four real energy photographs from Wikimedia Commons serve as materials within the example lesson; attribution, source and license links are below the closing poster. Resized copies are served locally (279 KB total), with source metadata in assets/credits.json. Font files are served locally; source: Fontshare Roundo (https://www.fontshare.com/fonts/roundo).

## Argument and proof

- MoodlIA helps carry a teaching idea into Moodle: an energy lesson assembled from course sections and activity slips.
- Rubrics moves established criteria into Moodle: a criterion/level matrix, with a guide to the real browser extension.
- Corrector assists feedback under teacher review: evidence, proposed comments and the teacher decision, with provider/manual-install requirements.
- Follow-up needs context: symbolic activity/grade/completion signals; no invented student outcomes or validated prediction claims.
- Content can be reused: two course artefacts and the actual plan/approve/apply/verify sequence; preview and scope limits stated.
- Tools have independent requirements: task selector and setup destinations.
- Institutional choices matter: provider, permissions and review, followed by the complete catalog and FAQs.

## Scene ledger

| Scene | Engine and trigger | Choreography | Alternative |
| --- | --- | --- | --- |
| Opening poster | GSAP, arrival/native scroll | Two-line title entrance, paper lifts as the visitor scrolls | All words and art visible without JS; no travel for reduced motion |
| Teaching journey | GSAP ScrollTrigger, desktop >=1000px and >=740px tall, native scrolling | One pinned stage; 5 labelled timeline scenes over 4.8 viewport heights; each chapter becomes the next full-field poster, with staggered inner artefacts | Natural vertical chapters on phones/tablets, reduced motion and no JS |
| Supporting sections | GSAP entrance, once at viewport edge | Short stagger for section parts, opacity never below .4; chapter text remains fully opaque | Fully visible before hydration and for reduced motion |

No wheel handlers, inertial scrolling, autoplay, remote AI requests or fake result controls. Inactive desktop chapters are inert and aria-hidden; cleanup restores all chapters. Refresh after fonts/load; matchMedia cleanup supports live viewport/preference changes. Content remains server rendered.

## Copy deck

Spanish: De idea / a Moodle. → La idea es tuya. El trabajo repetitivo puede dejar de serlo. → Dale forma. → Pon el criterio. → Haz que avance. → Mira el conjunto. → Vuelve a partir de aquí. → Cada herramienta tiene su puerta. → Empieza por lo que necesitas. → La decisión sigue siendo tuya. → Más caminos para tu curso. → Antes de empezar. → Tu próxima idea.

English carries the same argument and public product limits. No new claims about released features, measured time savings, real grades or production qualification.

## Imagery credits

- Ground mounted solar panels.gk — Grendelkhan, CC BY-SA 4.0.
- Windmills D1-D4 (Thornton Bank) — Hans Hillewaert, CC BY-SA 4.0.
- Solar panel energy control unit — Alexey laa, CC BY 4.0.
- Solar panels in Paysandú Department — Mx. Granger, CC0.

All four originals were visually inspected before use. The local copies are resized and cropped by CSS, with their original licenses retained. There is no unrelated stock footage: the visitor drives the movement of the lesson material directly.


## Current image-led iteration

The later accepted direction and image-led interior work supersede the initial
small paper-artefact treatment in this document. Current imagery, prompts and
page ownership are in `docs/editorial-imagery.md`; current review evidence is in
`docs/editorial-review.md`. The narrative, product limits and native-scroll
contract remain applicable.
