---
name: MoodlIA The Helpful Selection
description: A warm editorial system that presents practical Moodle help through people, paper, and three clear ways forward.
colors:
  canvas: "#f7f2e8"
  paper: "#fffdf7"
  ink: "#202733"
  ink-soft: "#626875"
  ballpoint-blue: "#315b9a"
  deep-blue: "#18375f"
  active-coral: "#b5443b"
  pressed-coral: "#8f302a"
  marker-yellow: "#f2c451"
  quiet-mint: "#a8c7b7"
  rule: "#d8d2c6"
  focus: "#0d5bd7"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(4rem, 7.8vw, 7.7rem)"
    fontWeight: 720
    lineHeight: 0.83
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(3rem, 6.2vw, 6rem)"
    fontWeight: 720
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.5rem)"
    fontWeight: 720
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.68
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  control: "0.35rem"
  inner-paper: "0.75rem"
  panel: "1.2rem"
spacing:
  page-edge: "clamp(1rem, 4vw, 4rem)"
  section: "clamp(5rem, 10vw, 9rem)"
components:
  primary-action:
    backgroundColor: "{colors.active-coral}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.2rem"
    height: "48px"
  primary-action-hover:
    backgroundColor: "{colors.pressed-coral}"
    textColor: "#ffffff"
  text-action:
    backgroundColor: "transparent"
    textColor: "{colors.ballpoint-blue}"
    typography: "{typography.label}"
    height: "48px"
  help-panel:
    backgroundColor: "{colors.deep-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
---

# Design System: MoodlIA The Helpful Selection

## Overview

**Creative North Star: "The Helpful Selection"**

MoodlIA should feel like a concise selection assembled by an experienced educator: personal, useful, and ready for the teaching moment at hand. Warm ruled paper, ballpoint-blue structure, colored track markers, short handwritten-style annotations, and layered photographs create the care of a prepared editorial insert without drawing a literal cassette or leaning on nostalgia.

The interface is education-first and deliberately nontechnical. People and teaching decisions lead; product mechanics appear only after a visitor chooses a way forward. The homepage's three overlapping educator photographs and three-track rail make the ecosystem memorable, while way and product pages reuse the same paper, sequencing, and direct-help language without repeating the whole composition.

**Key Characteristics:**

- Warm cream paper with quiet blue ruled lines.
- Three numbered routes with stable blue, coral, and yellow accents.
- Real educator photography mounted as overlapping paper prints.
- Large authored display type paired with compact, readable sans-serif copy.
- Ruled lists, captions, tabs, and modest rotations instead of generic card grids.
- Direct human help throughout; GitHub appears only as a product-page action.

The four shipping `*-v2.jpg` images were generated for this redesign on 2026-08-20. Their prompts require warm editorial education photography, no readable text or logos, and no futuristic or abstract AI imagery; the prompt records live in `.impeccable/prompts/`.

## Colors

The palette is warm and paper-led, with blue providing structure, coral providing action, and yellow and mint keeping the three-route story optimistic and human.

### Primary

- **Ballpoint Blue** (`ballpoint-blue`): Navigation, structural links, the first route, and the brand-track mark.
- **Deep Blue** (`deep-blue`): Large direct-help panels and high-contrast hover states.

### Secondary

- **Active Coral** (`active-coral`): Primary actions, the second route, active underlines, and small emphasis marks.
- **Pressed Coral** (`pressed-coral`): Coral hover and pressed states; never a large passive field.

### Tertiary

- **Marker Yellow** (`marker-yellow`): The third hero line, the third route, list bullets, and emphasis on dark-blue panels.
- **Quiet Mint** (`quiet-mint`): Calm photographic backing and small proof markers.

### Neutral

- **Warm Canvas** (`canvas`): The ruled page field and default copy backdrop.
- **Clean Paper** (`paper`): Mounted photographs and contrasting editorial sections.
- **Warm Ink** (`ink`): Headlines, rules, and primary reading contrast.
- **Soft Ink** (`ink-soft`): Supporting copy, captions, and metadata.
- **Paper Rule** (`rule`): Dividers, tracklist rows, and subtle structure.
- **Blueprint Focus** (`focus`): Keyboard focus only, chosen for unmistakable contrast.

**The Three-Track Rule.** AI integration is blue, teaching tools are coral, and learning insights are yellow with dark ink. Number, label, and position must repeat the distinction so color never carries meaning alone.

**The Paper Leads Rule.** Accent colors identify routes and actions; they do not replace the warm paper field as the dominant surface.

## Typography

**Display Font:** Bricolage Grotesque (with Arial and sans-serif fallbacks)
**Body Font:** DM Sans (with Arial and sans-serif fallbacks)

**Character:** Bricolage Grotesque gives short statements an authored, slightly irregular confidence. DM Sans keeps bilingual navigation, explanations, metadata, and product detail calm and readable.

### Hierarchy

- **Display** (weight 720, fluid 4–7.7rem, line-height 0.83): Homepage and detail-page hero statements; short, sentence-case, and tightly set.
- **Headline** (weight 720, fluid 3–6rem, line-height 0.95): Major section transitions and direct-help invitations.
- **Title** (weight 720, fluid 1.55–2.5rem, line-height 1): Tracklist and project titles.
- **Body** (weight 400, 1–1.18rem, line-height 1.62–1.7): Explanatory copy, generally constrained to about 55–68 characters per line.
- **Label** (weight 720–850, 0.68–0.82rem): Navigation, sequence numbers, captions, buttons, and metadata; uppercase is reserved for compact metadata.

Handwritten character comes from brief rotated annotations and drawn underlines, not a third font.

**The Two-Voice Rule.** Bricolage Grotesque declares; DM Sans explains and enables action. Do not introduce another display or decorative typeface.

**The Short Statement Rule.** Large type earns its scale through concise copy. Long technical explanations belong below the hero and on product pages.

## Layout

The main container is capped at 1380px with fluid page edges. Sections use generous vertical space, but related content stays dense: a promise beside imagery, a heading beside a short explanation, or a ruled list directly beneath its introduction.

The homepage opens with a split hero and three overlapping portrait photographs, followed immediately by a horizontal three-track sequence. Route sections alternate a mounted photograph and editorial copy. Way pages pair an opening statement with one photograph before a ruled project tracklist. Product pages pair product identity and actions with the route photograph, then use three practical information columns, related products, and direct help.

- At 1000px, primary navigation is hidden, the header becomes two-column, and wide grids tighten.
- At 820px, split layouts become single-column, the sequence rail turns vertical, product columns stack, and related-project grids become lists.
- At 620px, page edges become 14px, the contact button leaves the header, hero actions stack, the photo collage becomes compact, and detail figures keep a small inset from the viewport edge.

Interaction targets are at least 44px tall, and the mobile reading order always keeps copy before its supporting route photograph on detail pages.

**The Sequence Survives Rule.** Responsive layouts may stack, but route numbers, ruled continuity, captions, and the order one–two–three remain visible.

## Elevation & Depth

Depth comes from close paper shadows, overlaps, colored backing sheets, and rotations of roughly one to five degrees. The canonical mounted-paper shadow is `0 1.5rem 4rem rgba(62, 54, 43, .13), 0 .2rem .7rem rgba(62, 54, 43, .1)`. Large image cards may deepen to `0 2.2rem 5rem rgba(62, 54, 43, .18)` while lifting on hover. Primary actions use a smaller coral-tinted shadow that compresses as the button moves one pixel down.

**The Paper Contact Rule.** Shadows describe one sheet or photograph resting above another. Do not use ambient elevation to make ordinary paragraphs look like application cards.

## Shapes

The system is mostly rectangular. Controls use a small 0.35rem radius, inner paper backings use about 0.75rem, and the two major help panels use 1.2rem. Circular geometry is reserved for route numbers, compact arrow controls, list bullets, and the three-stripe brand mark. Photo mounts keep square outer corners while their colored backing sheets may soften slightly.

Fold-like offsets, ruled borders, caption strips, and slight rotations create material character. Avoid pills, glass surfaces, large generic rounded cards, and decorative boxes around every text group.

**The Useful Shape Rule.** A circle marks sequence or action; a line connects or separates; a rotated rectangle reads as paper. Do not add geometry without one of those jobs.

## Components

### Primary and Text Actions

- Primary actions are coral, white, compactly rounded, at least 48px high, and set in heavy DM Sans. Hover darkens coral, reduces the shadow, and moves the control down by one pixel.
- Secondary actions are blue text with a two-pixel underline and remain visually subordinate to the coral action.
- Every interactive link or button receives a three-pixel Blueprint Focus outline with a four-pixel offset on `:focus-visible`.

### Site Navigation and Language Switcher

- Desktop navigation is centered between the wordmark and actions; its coral underline grows from the left on hover.
- The EN/ES switch is a compact bordered pair with 44px targets. The current language uses Warm Ink on Clean Paper contrast and exposes `aria-current="page"`.
- The header contact action is direct and blue. It remains visible as a compact help action on mobile so human support is never buried below the full page.
- The language switch preserves the equivalent page path.

### Mounted Educator Photography

Photography uses a 4:5 crop, a Clean Paper mount, a printed caption, a numbered marker, and a softly rotated colored backing sheet. The homepage hero overlaps three photographs; route and product pages use one larger mounted photograph. Alternative text describes the educator's teaching task, while captions supply the editorial interpretation.

### Three-Track Rail and Tracklists

The three-track rail doubles as navigation and ecosystem explanation. It uses numbered circular markers, ruled divisions, text labels, and route-specific hover washes. Product and outcome lists reuse the same numbered ruled rhythm without becoming cards.

The rail is a stable three-route navigation element and does not imitate progress or loading. Hero photographs provide the one authored entrance in a staggered 0.9-second sequence. Hover movement is limited to interactive elements. `prefers-reduced-motion` reduces animations and transitions to effectively instant, disables smooth scrolling, and removes decorative transforms from selected elements.

Page navigation treats the content as one paper sheet replacing another while the header remains visually stable. Native cross-document View Transitions handle this when available; the static-site fallback gives the current sheet a 140ms exit and the arriving sheet a 320ms reveal. Same-page anchors keep their normal scroll behavior, modified clicks remain native, and reduced-motion preferences bypass the replacement animation entirely.

### Direct-Help Panels

Direct-help panels are the only large Deep Blue surfaces. They combine a large typographic mark, a short invitation, plain explanatory copy, and a visible `mailto:` action. The homepage and every detail page end with this human route.

### Accessibility Behavior

Pages use a skip link, semantic landmarks, one route-level H1, descriptive image alternatives, visible focus, minimum 44px targets, reduced-motion support, and forced-colors borders for photographs, help panels, and primary actions. Decorative numbers, annotations, and marks are hidden from assistive technology when they repeat adjacent meaning.

## Do's and Don'ts

### Do:

- **Do** lead with real educators, teaching moments, and clear outcomes before implementation detail.
- **Do** preserve the three numbered routes and their blue, coral, and yellow assignments.
- **Do** use ruled paper, captions, modest rotation, and close shadows as one coherent editorial material vocabulary.
- **Do** keep English and Spanish structurally equivalent, concise, and page-preserving.
- **Do** make direct help visible and keep GitHub actions on individual product pages only.
- **Do** retain the skip link, visible focus, 44px targets, meaningful alternative text, reduced motion, and forced-colors fallbacks.

### Don't:

- **Don't** turn the experience into a generic SaaS hero, rounded feature-card grid, or technical dashboard aesthetic.
- **Don't** use robots, holograms, dark technology imagery, abstract AI symbols, or fabricated product screenshots in place of human education photography.
- **Don't** add gradients that imply technology, glassmorphism, neon, or unrelated accent colors.
- **Don't** use Unicode glyphs as a substitute for authored or library icons.
- **Don't** expose GitHub in global navigation, way pages, or the homepage.
- **Don't** add testimonials, logos, metrics, or claims without approved evidence.
- **Don't** canonize the legacy kraft-board, brass-pin, stencil-type, or hand-crank “Learning Automata” vocabulary; it is not present in the shipped interface.
