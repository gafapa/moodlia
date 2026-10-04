# Design

Clear product documentation in the colours of the MoodlIA logo. The site
explains and instructs; decoration never competes with steps and commands.

## Colour

Tokens live on `:root` in `app/globals.css`, with a dark-mode set under
`prefers-color-scheme: dark`.

| Token | Light | Use |
| --- | --- | --- |
| `--brand` | `#07464a` | Hero, help box, step numbers: the logo's deep teal |
| `--accent` | `#c8452c` | The one primary action per view (coral, darkened for contrast with white text) |
| `--lime` | `#c9f65b` | Small markers: hero eyebrow, social image |
| `--ink` / `--muted` | `#0f2a2c` / `#4a6163` | Text |
| `--bg` / `--surface` / `--tint` | `#f5f8f7` / `#fff` / `#e9f1ef` | Page, cards, alternate sections |
| `--code-bg` | `#0c2426` | Code blocks, dark in both modes |

Knowledge levels have their own tag colours: lime for "anyone with a browser",
mint for "a little technical help", coral for "administrators and developers".
Connection lanes on the How it works page reuse the same three colours.

## Type

Geist for text and headings, Geist Mono for code, eyebrows, and the language
switch. Headings use weight 650 with tight tracking; body text is 17 px with a
1.6 line height.

## Components

- Header: sticky, logo, Apps · Install · How it works · Help, EN/ES switch. On
  phones the navigation moves to a second row.
- App card: place and status tags, name, one-line summary; the whole card is
  the link.
- Steps: numbered teal circles, each step optionally followed by a code block
  with a Copy button. The only script on the site wires those buttons.
- Inline code: text between backticks in `app/content.ts` renders as `<code>`.
- Side card on app pages: primary action, knowledge level, version, license,
  documentation links.
- Help box: teal panel with the contact address, at the end of every page.

## Images

`public/og-moodlia.png` (1200×630) is the social preview for every page. The
site uses no photography.
