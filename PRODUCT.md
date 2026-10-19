# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors arrive with a task to improve, not necessarily an understanding of
the repository layout. Communicate clearly without classifying who can install
or use a tool, or assigning setup to a professional role. Describe technical
requirements and configuration steps directly.

## Product Purpose

Explain the value of MoodlIA, demonstrate real supported workflows, and guide
a visitor to a suitable tool and its actual setup. Promote adoption of the
open-source projects. No paid service, subscription or purchase flow has been
authorized or defined.

## Positioning

The Moodle plugin and CLI let an approved assistant or workflow work with
Moodle itself instead of only producing text for a person to copy. A content
design skill supports local authoring without becoming an execution dependency.
Independent tools support spreadsheet rubric import, teacher-reviewed AI
grading suggestions, course-content reuse, and course follow-up.

The working editorial priority comes from the portfolio review in
`docs/portfolio-strategy.md`: lead with the AI-to-Moodle connection; offer
Rubrics as the simplest first step; explain Corrector and course reuse next.
This is a product judgment based on reviewed evidence, not market validation
or proof of measured time savings.

## Operating Context

- The Moodle plugin requires installation on the site and configured access.
- Rubrics is a browser-store extension independent of the Moodle plugin.
- Corrector is a manually installed Chrome extension. Its public release is
  0.1.45; the 0.1.62 local working tree is not the public download.
- CLI/Core clients and Sync require configured services and tokens. GitHub
  and npm versions can differ; name the distribution channel explicitly.
- Some applications are available only from source, with technical setup.
- AI features use the selected provider; a local configuration is an option,
  not a claim that every workflow keeps evidence on the user's machine.

## Capabilities and Constraints

Product facts live in `app/content.ts`, in English and Spanish. Homepage
narrative lives in `app/cinematic-copy.ts`. The website cannot execute an assistant's
Moodle task and does not claim its illustrative brief is a live demonstration.

Public availability is not one status. Distinguish store-ready tools, manual
extension downloads, source-only applications and preview/beta workflows.
Corrector's public release belongs in the catalog. Studio is concept-only;
Sync MCP and the legacy monorepo are superseded and not available-product
entries. Analyzer Desktop is a related source-based alternative to browser
analytics, not an extra featured product or a verified universal download.

Sync excludes learner submissions, awarded grades, attempts and history.
Converter compatibility is profile- and content-dependent. Analyzer risk
signals are heuristics, not scientifically validated outcome predictions.

## Structure

- Home: flagship promise and illustrative workflow, low-friction Rubrics entry,
  teacher-reviewed Corrector workflow, distinct course-reuse paths, data/access
  choices, task starting points, directory, FAQ and human help.
- Tools (`/apps`, `/es/apps`): complete public tool directory grouped by
  outcomes, with availability and execution environment shown per tool.
- Tool (`/apps/<slug>`): purpose, requirements, factual setup, first use,
  limitations, documentation, version, license and source.
- Installation (`/install`, `/es/instalar`): actual installation grouped by
  execution environment.
- How it works (`/how-it-works`, `/es/como-funciona`): connection options,
  operation boundaries and the technical package chain.
- Legal notice, privacy and cookies.

Retired `/start`, `/ways/*` and `/products/*` routes have static redirects.
The old Corrector product route now leads to the real Corrector guide.

## Brand Commitments

MoodlIA is independent and not affiliated with Moodle HQ. Preserve that
statement, the existing logo, and `contact@moodlia.com`. Explain benefits in
plain language without presenting technical components as unrelated flagship
products. Use the user-requested graphical scroll story in place of the rejected connected-network homepage while
letting the portfolio story determine information hierarchy.

## Evidence on Hand

Sibling source repositories, READMEs, manifests, contracts and release
instructions; public GitHub release metadata, npm versions, Moodle Marketplace
and Chrome Web Store listings checked on 2026-10-19. The portfolio assessment
records the scope and limits. Public evidence snapshots are under
`.impeccable/research/`.

No approved customer testimonials, organizational logos, time-saving
benchmarks, learning-outcome studies or conversion measurements exist in the
reviewed material. Do not fabricate them or imply fresh runtime qualification
of every project from a documentation review.

## Product Principles

- Lead with a useful outcome, then name the tool and setup.
- Group execution engines, clients and instructions as parts of a workflow.
- Make availability and configuration friction visible before installation.
- Keep teacher review, provider choice and Moodle permissions understandable.
- Separate implemented/public capability from local work, previews and ideas.

## Accessibility & Inclusion

Semantic landmarks, one H1 per page, visible keyboard focus, skip link,
reduced-motion support, legibility under both system colour schemes and no horizontal overflow at 390px. English
and Spanish are equivalent routes with matching metadata and language links.
Documentation, comments and code identifiers are in English.
