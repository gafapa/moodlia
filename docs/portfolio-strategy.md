# MoodlIA portfolio and website strategy

Reviewed: 2026-10-19. This assessment replaces a repository-count-led homepage with a product-value-led narrative.

## Decision

Present MoodlIA as a way to turn educational intent into work inside Moodle. Lead with the AI-to-Moodle connection, offer an immediate entry through rubric import, and explain teacher-reviewed grading and course reuse as concrete adjacent outcomes. Keep the implementation stack behind those outcomes.

This is an editorial and product recommendation, not a market-validation result. No interviews, measured time savings, learning-outcome study, conversion experiment, or fresh qualification of every application was performed. All audiences remain welcome; they do not need equal billing for every repository in the first viewport.

## Evidence and review method

Reviewed every project directory's README, package/manifest or source entry points, implementation status, dependencies, and distribution route. Sampled the plugin contract, Corrector workflow, Analyzer heuristics, and Sync capability matrix. Checked public GitHub repository/release metadata with the GitHub API, npm versions with `npm view`, the Moodle Marketplace listing, the Chrome Web Store listing, and the hosted Backup Converter response. Public metadata is retained in `.impeccable/research/portfolio-snapshot-2026-10-19.json`.

Documentation and source establish implemented scope; they do not establish that every feature works on a visitor's Moodle, that a statistical signal predicts outcomes, or that a local candidate has been published. Distribution findings below are dated observations.

## Portfolio organization

| Project | Visitor's problem and real value | Adoption and evidence | Website role |
| --- | --- | --- | --- |
| Moodle plugin | Make an approved AI assistant or workflow inspect and modify actual Moodle courses, activities, questions and settings. Moodle stays the system of record. | Public Marketplace listing and GitHub ZIP 0.1.219; explicitly beta/prerelease. Administrator setup and per-user Moodle permissions required. | Flagship capability. Explain the result first, then offer setup to the administrator. |
| MoodlIA CLI | Execute the same operations through scripts, developer tools and agent shells; add adaptive Core access and optional browser transport. | GitHub package 0.5.1; npm remains 0.4.1. Browser component belongs to the GitHub 0.5.1 path. | Developer route within the flagship, not a competing homepage product. |
| Moodle Core CLI | Automate exposed standard Moodle services where installing a plugin is not possible. | npm 0.4.1. Requires enabled services and an authorized token. Core capability coverage is not identical to plugin authoring. | Alternative developer entry, with explicit capability limits. |
| Content skill | Create accessible Moodle HTML with local assets and static alternatives. | One complete portable-content skill with an editable example and static validator. Site behavior and restored portability need separate evidence. | Support content authoring independently; publication uses available Moodle tools. |
| Rubrics | Transfer criteria, levels and marks from a spreadsheet into the Moodle rubric editor instead of re-entering each cell. | Chrome Web Store 1.2.1 verified. Works on assignment/Workshop rubric forms. Local parsing, no Moodle administrator installation. | Strongest low-friction entry and a concrete before/after story. |
| Corrector | Produce AI-assisted grading suggestions in the assignment grading page, then let the teacher review and apply them to the form. | Public ZIP 0.1.45 exists. Local working tree is 0.1.62 with substantial unpublished changes. Manual extension installation and an approved AI endpoint/model are required. | High-potential teacher-facing product, with manual-install status and version-specific instructions. Do not advertise local-only features as released. |
| Sync | Reuse supported course structure/content across Moodle sites through plan, approval, application and verification. | GitHub package 0.1.2; npm remains 0.1.1. Project is preview despite the release object's non-prerelease flag. Coverage depends on both providers and content types. | Institutional reuse story. Prominent preview label; never promise a complete site migration. |
| Backup Converter | Adapt a newer Moodle backup for selected older branches, entirely in the browser. | Hosted tool responds successfully. Established and experimental profiles differ; restoration is not universally guaranteed. | Useful immediate utility and rescue use case, with a direct tool link and limitations. |
| edX Converter | Reuse supported Open edX OLX structure, HTML and question types in Moodle. | Browser-only implementation and public source, no verified hosted installation or release download in this review. Unsupported blocks are reported. | Specialized migration tool. Offer source/setup, not an invented one-click hosted app. |
| Analyzer Web | Bring Moodle activity, grades and completion signals together for teacher follow-up. | Public source; token, endpoint availability and CORS/bridge setup required. Prediction code explicitly uses heuristics. | Secondary follow-up capability. Describe indicators, not validated failure predictions. |
| Analyzer Desktop | Deliver a related course/student analysis workflow as a Python desktop application. | Public source and build scripts. No public GitHub release binary verified; Actions artifacts are not a universal download. | Deployment alternative for analytics, not an extra headline feature to inflate the catalog. |
| Teacher Dashboard | Gather courses, deadlines, resources and Moodle links into one screen. | Public browser implementation; token and permitted browser REST/CORS access required. | Supporting everyday utility. A useful companion, less differentiated than the flagship. |
| Test Lab | Exercise interoperability and regressions on disposable Moodle versions. | Public source, golden-image workflows and qualification documentation. This review did not rerun hosted CI. | Supporting engineering evidence; not a teacher-facing application. |
| Studio | A possible future visual course workspace. | README explicitly says concept only; no implementation. | Exclude from available products and do not show an app mockup that suggests it exists. |
| Sync MCP | Former cross-site coordinator. | Repository archived; npm explicitly deprecated in favor of Sync. | Exclude from sales/navigation. Preserve migration guidance in technical documentation. |
| Legacy monorepo | Historical implementation before project extraction. | Workspace marks it archived/read-only and noncanonical. | Exclude from product navigation and release sources. |
| Website | Explain, demonstrate and route visitors to the appropriate supported entry point. | Existing bilingual site, application guides and static export. | Present the portfolio through outcomes; keep a complete technical directory one level deeper. |

## Value priorities

### Lead: AI that can work inside Moodle

The plugin and CLI are the most distinctive strategic offer: the work lands in Moodle instead of ending as text that the teacher must manually recreate. The practical story is preparing a course structure, adding an activity or question bank, and reviewing the course configuration. The separate content skill supports authoring accessible portable resources; it is not an operational interface. The public interface remains permissions-bound. An institution chooses its assistant/provider; the plugin itself is not an AI model or a hosted AI subscription.

Do not make a first-time teacher choose among REST, MCP, WebMCP, Core adapters and CLIs. Explain the educational job; show a teacher route and an administrator/developer setup route below it. Installation remains a real barrier and must be visible.

### Offer a useful first step: Rubrics

Rubrics is the clearest low-friction acquisition path: a bounded repetitive task, visible output, a store installation, and no AI-server setup. Demonstrate spreadsheet criteria becoming a Moodle rubric. Do not claim a measured number of hours saved.

### Develop and explain: Corrector

Teacher-reviewed grading is compelling, but distribution and product readiness must not be confused. Public 0.1.45 supports Ollama or a compatible remote API; the richer named-server/settings workflows in local 0.1.62 are not part of that public release. The public version does not read the contents of assignment reference files merely because it lists them.

Show the actual review chain: submission and criteria → AI proposal → teacher review → apply to grading fields → teacher saves in Moodle. The extension does not automatically submit the grading form. AI evidence reaches the selected provider, even though direct identifiers are minimized. A local provider is an option, not a blanket guarantee that every configuration keeps data on the machine.

### Expand the institutional story: reuse courses

Sync, Backup Converter and edX Converter solve related reuse problems but are not interchangeable. Sync works between configured Moodle sites on supported content and excludes learner submissions, awarded grades, attempts and history. Backup Converter transforms a file with profile-specific limits. edX Converter maps supported OLX blocks and reports partial/skipped content.

Keep each promise specific. “Reuse your course content” is defensible; “migrate any Moodle or edX course without loss” is not.

### Keep secondary: follow-up and the technical foundation

Analytics and the dashboard support teacher decisions but have more connection friction and less demonstrated differentiation. Do not lead with the number of charts or a heuristic risk probability. Group browser/desktop analytics as related alternatives and disclose setup. Keep Test Lab as evidence and SDK/CLI details accessible to developers.

## Website story

1. **Recognize the problem:** an assistant can draft ideas, but turning them into Moodle activities and maintaining courses still means repetitive work.
2. **Make the flagship promise concrete:** connect an approved assistant to Moodle so course preparation and review can act on the actual platform, within the account's permissions.
3. **Show a bounded example:** a proposed course outline, the supported Moodle actions it needs, and the point at which a human reviews the work. Label the example illustrative; do not fabricate a transcript, execution result, student or testimonial.
4. **Provide an immediate entry:** import a rubric without installing the Moodle plugin. Give a direct product guide and the verified store route.
5. **Introduce reviewed grading:** show Corrector's actual teacher-control workflow, public version and manual setup. Avoid unpublished feature promises.
6. **Preserve existing work:** explain the three reuse paths, with Preview/source labels where appropriate.
7. **Earn trust with explicit choices:** open source, no MoodlIA AI account required, human review, Moodle permissions, and a clear explanation of provider data flow.
8. **Route the visitor:** teachers can start with Rubrics/Corrector; administrators can enable the plugin; developers can choose CLI/Core; content authors can use the portable-content skill. Analytics and the full directory remain discoverable.

Primary conversion: choose a supported starting workflow and reach its exact setup. Secondary conversion: ask for help with an institutional setup. “Sell” is interpreted as communicate value and encourage adoption; no prices, paid service packages, purchase flow or sales claims are invented.

## Proposed copy and content hierarchy

The website's localized copy should express these ideas naturally rather than translate technical repository descriptions:

- Hero: an AI assistant that can work in Moodle, with practical course creation/review examples and visible administrator setup.
- Low-friction entry: spreadsheet to Moodle rubric, with the teacher reviewing the imported form.
- Grading: suggestions from the chosen AI, the teacher retaining the final grade and save action.
- Reuse: retain useful course content when moving between supported contexts.
- Trust: choose the provider and permissions; clarify which tools process locally and which send evidence to an AI service.
- Catalog: group by purpose, with installation knowledge and distribution status attached to each item.

Remove “ten apps” as the main value proposition. The public Corrector release was previously omitted, whereas several source-only projects were presented alongside store-ready tools. Correct the catalog policy and make readiness explicit. A repository count is neither a benefit nor a reliable product boundary.

## Implementation boundaries

The user subsequently rejected the connected-network layout and requested a graphical story with purposeful movement. The cinematic homepage in `docs/cinematic-direction.md` now implements that direction while retaining this portfolio assessment. Preserve English/Spanish parity and existing useful routes. Add the missing public Corrector guide and update static export, sitemap, navigation, metadata, privacy explanations and regression coverage consistently. Do not publish another project's working changes or modify its repository during this website task.

Technical details belong in product/setup pages. Every homepage claim must map to an implemented, publicly accessible workflow or an explicitly labeled preview. No fake demo controls, fabricated success state, customer logos, unverified uptake figures, quantified time savings, predictive-accuracy claims, or new release publication are part of this work.

## Source pointers

- `../moodlia-moodle-plugin/README.md`, `docs/interface-contract.md`, `contract/`; [Marketplace](https://marketplace.moodle.com/plugins/local_moodlia), [0.1.219 release](https://github.com/gafapa/moodle-local_moodlia/releases/tag/v0.1.219).
- `../moodlia-cli/README.md`, `browser/README.md`; [0.5.1 release](https://github.com/gafapa/moodlia-cli/releases/tag/v0.5.1); npm `moodlia` 0.4.1 checked live.
- `../moodle-core-cli/README.md`, `../moodlia-skills/README.md`.
- `../moodlia-rubrics/README.md`, extension parser/model; [Chrome Web Store](https://chromewebstore.google.com/detail/rubricando-para-moodle/ohicmoijcdaddlljgoaoocpjamfnmpgl), version 1.2.1 checked live.
- `../moodlia-corrector/README.md`, manifest and grading content script; [public 0.1.45 README](https://github.com/gafapa/moodlia-corrector/blob/v0.1.45/README.md), [release](https://github.com/gafapa/moodlia-corrector/releases/tag/v0.1.45).
- `../moodlia-sync/README.md`, `docs/SYNC-CAPABILITY-MATRIX.md`; [0.1.2 release](https://github.com/gafapa/moodlia-sync/releases/tag/v0.1.2); npm `moodlia-sync` 0.1.1 checked live.
- Converter, dashboard, analyzer, Studio, Test Lab, deprecated coordinator and workspace READMEs; Analyzer Web `src/analysis/courseAnalyzer.ts` explicitly identifies the prediction method as heuristic.
- External positioning references: [Brisk teachers](https://www.briskteaching.com/solutions/teachers), [MagicSchool](https://www.magicschool.ai/). Their task-led framing is useful; their claims, customer proof and product capabilities do not transfer to MoodlIA.
