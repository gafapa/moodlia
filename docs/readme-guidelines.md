# MoodlIA README guidelines

## Reader journey

Maintained project entry-point READMEs use these second-level sections, in order:

1. **Status**: state whether the project is implemented, a preview, experimental or concept-only. Distinguish source versions, generated candidates, public releases, store approval and deployment.
2. **Getting started**: give prerequisites and the shortest supported installation or launch path. Commands run from an explicit directory; concepts have no invented launch flow.
3. **Usage**: explain the primary workflow, supported features and practical limitations. Keep exact commands, input formats and contracts available.
4. **Development**: describe local checks, builds and package generation. Distinguish synthetic checks, recorded evidence and real-site qualification.
5. **Security and privacy**: say where data and credentials are processed, stored or transmitted. Explain actual permission boundaries and AI-provider involvement; do not imply that every tool is offline or that minimization guarantees anonymity.
6. **Documentation**: link source, issues, relevant local guides and related MoodlIA projects. Use canonical GitHub URLs rather than sibling-relative paths in independently published repositories.
7. **License**: identify the repository license and retain third-party notices.

Start with a plain-language purpose paragraph and a consistent product name. Use sentence case headings, English documentation and fenced examples with meaningful language tags. Existing detailed topics can remain third-level sections; preserve old heading anchors where practical. Component READMEs follow the same journey when applicable. Asset attribution notes may use a smaller relevant subset.

## Maintenance rules

- Explain how each project fits into MoodlIA without making the dependency graph the main user story.
- Preserve exact operational instructions and safety limits while improving organization. Label dated release notes as historical evidence.
- Avoid unsupported readiness claims, generic marketing copy, obsolete version promises and repository-management diary entries.
- Verify local links, README npm commands, heading order, referenced versions and licenses when updating an entry point.
- Keep archived repositories unchanged. Maintain current migration guidance in the destination project instead.
- Keep permanent extension privacy URLs unchanged: `https://moodlia.com/privacy/corrector.html` and `https://moodlia.com/privacy/rubrics.html`.
- README reorganization does not publish packages, submit stores, deploy websites or qualify additional runtime platforms.

## Workspace scope

The 2026-10-20 alignment covers 16 maintained root READMEs, five component/asset READMEs, and the workspace overview outside Git. Four READMEs inside the two archived repositories remain historical and unchanged. Detailed technical guides remain authoritative for contracts and dated qualification evidence.
