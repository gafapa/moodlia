# Workspace documentation review — 20 October 2026

## Scope and method

Reviewed the documentation inventory of all 18 independent Git repositories in `D:\Proyectos\moodlia`: 138 tracked Markdown documents at the initial inventory; 153 after including the website documentation already in progress, the migration guide, this review and the Corrector 0.1.66 follow-up report. Local Markdown link targets and README `npm run` commands were checked against each repository. Current entry-point documentation was compared with package metadata, published-file declarations, CLI routing, operation contracts, browser/module entry points, storage boundaries, workflow definitions and existing dated evidence. No missing local Markdown targets or undefined README npm-script names were found.

This review updates current usage instructions; historical release notes, archived plans and dated qualification reports retain their original evidence and versions. The active Core and MoodlIA contracts contain 788 and 250 operations respectively. Checking documentation is not a new live Moodle qualification, native-platform certification, registry publication or Chrome Web Store approval.

## Project results

| Repository | Result |
| --- | --- |
| `mcpapiclimoodle` | Archived migration source remains explicitly historical; active project ownership and existing documentation links are consistent. No changes. |
| `moodle-core-cli` | Corrected a write example that reused a read-only client. Clarified that the recorded Moodle 5.3 beta source qualification does not automatically cover later stable snapshots. |
| `moodlia-analyzer-desktop` | Checked Python entry/build files, local credential and language documentation, and existing platform boundaries. No discrepancies requiring changes. |
| `moodlia-analyzer-web` | Corrected the local Vite base URL and identified stack versions as declared dependency ranges, with the lockfile authoritative for resolved versions. A compatible lockfile refresh fixes the CI audit findings; local checks and the new remote CI run pass. |
| `moodlia-backup-converter` | Target profiles, experimental/established distinction, 768 MiB input and 2 GiB expansion bounds, worker-only processing and local build commands match source. No changes. |
| `moodlia-cli` | Added the current 0.5.1 entry-point scope, identified old synchronization scope as historical, and documented the actual package directories including optional WebMCP, Core, adaptive and adapter exports. |
| `moodlia-corrector` | Updated current provider/HTTP/privacy behavior, editable Moodle-form semantics, eight-locale checks, submission-page reproduction, hosted permanent policy URLs, and generated-output exclusions. Existing per-version reports remain historical. CI also exposed a locale reset on repeated activation; version 0.1.66 fixes it, with 49 unit tests and 72 browser checks passing locally and in the follow-up Linux CI run. |
| `moodlia-edx` | Browser-only conversion scope, supported source types, Spanish UI limitation and npm commands are consistent with the current entry points. No changes. |
| `moodlia-moodle-plugin` | Version 0.1.220, component name, 250-operation contract, REST/MCP/WebMCP boundaries, deployment evidence and historical release notes are consistent. No changes. |
| `moodlia-portable` | Package/runtime lock metadata and documentation distinguish Windows synthetic execution from unqualified native combinations, signing and other platforms. No changes; no installer or live workspace was run. |
| `moodlia-rubrics` | Current 1.2.1 manifest matches the documented manual activation and optional HTTPS origin model; no required host grants or static content scripts are declared. No changes. |
| `moodlia-skills` | The repository offers only portable content authoring and explicitly retires the operational skill; validator commands and evidence boundaries are consistent. No changes. |
| `moodlia-studio` | Repository and README consistently identify a concept without implementation. No changes. |
| `moodlia-sync` | Corrected the dependency description to include `parse5` and `better-sqlite3`, alongside the MoodlIA/Core chain. Added maintained migration guidance for the archived MCP coordinator. Existing plan/approval/recovery and historical qualification descriptions are retained. |
| `moodlia-sync-mcp` | GitHub confirms that this repository is archived/read-only. Its historical source and README remain unchanged. The maintained `moodlia-sync` migration guide now distinguishes its legacy 0.3 approval examples from current commands. |
| `moodlia-teacher-dashboard` | Replaced unsupported direct `file://` launch guidance with HTTP serving for JavaScript modules; documented the bundled `npm run dev` server. |
| `moodlia-test-lab` | Updated the sync package example to 0.1.2 and documented the runner's exact bare-version versus existing-tarball handling. No Docker qualification was started. |
| `moodlia-website` | Updated current design/publication documentation, permanent policy ownership, source-versus-tagged-release distinction, cross-project review and current dependency-audit limits. |

## Publication boundaries

The workspace-level README already lists the active project split, deprecated synchronization coordinator, Portable, and last tagged/public distributions. It remains a local workspace file outside these independent Git repositories. Source updates are pushed to each affected repository; generated extension ZIPs, extracted publisher folders, caches, local configuration and credentials are not committed.

The Corrector and Rubrics public policies returned HTTP 200 and matched `moodlia-website/public/privacy/*.html` byte for byte during this review. Their stable routes remain protected by the website's design rules, route contract, rendered tests and static export.

Corrector has zero dependency-audit findings. The website's compatible dependency fixes remove all production findings. Eight high development-tool findings remain through the upstream `braces` dependency chain; no compatible patched version was available in the checked registry. No forced framework downgrade or weakened audit policy was applied. The unchanged gates require no high production findings and no critical findings anywhere.

Fresh code/build verification and remote commit IDs are recorded with the repository pushes. Existing dated deployment and platform evidence is not relabeled as newly executed by this documentation review.

During final verification, new uncommitted `moodlia-portable` license/README edits appeared outside this review. They were inspected and preserved without staging or publishing them; the clean-worktree claim applies only to this review's own changes.
