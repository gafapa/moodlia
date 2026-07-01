# MoodlIA Moodle API/CLI Automation

This repository contains the MoodlIA Moodle local plugin (`local_moodlia`), the shared operation contract, deployment automation, browser/API test automation, and a Node CLI that calls the Moodle REST API directly.

The project keeps API, CLI, and MCP tools aligned through one canonical operation contract. Moodle business behavior lives in PHP operation classes and uses Moodle core APIs instead of plugin-owned database tables or raw SQL.

## Design Goals

- Expose one Moodle operation set through REST, MCP, and CLI.
- Keep Moodle business behavior in PHP operation classes.
- Keep REST, MCP, and CLI layers as thin adapters over the same operation layer.
- Define a canonical operation contract as the source of truth for schemas, client types, CLI commands, and parity tests.
- Use Moodle core APIs for capabilities, contexts, files, web services, persistence, upgrades, privacy, and testing.
- Support direct SFTP deployment followed by API, MCP, CLI, and browser verification.

## Documentation Map

- [Project website](site/index.html): installer-oriented overview and technical architecture page.
- [Moodle plugin guidelines](docs/moodle-plugin-guidelines.md): Moodle API usage rules, plugin boundaries, security, privacy, files, upgrades, and anti-patterns.
- [Architecture](docs/architecture.md): shared core model, data flow, interface adapters, contract ownership, and reuse rules.
- [Interface contract](docs/interface-contract.md): canonical operations, parameter and return rules, naming conventions, error handling, and parity requirements.
- [CLI usage](docs/cli-usage.md): installation, configuration, command discovery, JSON parameters, and practical recipes for Moodle workflows.
- [Install and release guide](docs/install-release-guide.md): installation, packaging, deployment, verification, demo course generation, and rollback checklist.
- [Npm package](docs/npm-package.md): public `moodlia` package contents, sync process, verification, and publish workflow.
- [Activity subelement API boundaries](docs/subelement-api-boundaries.md): implemented subelement areas, intentionally unavailable writes, and the acceptance standard for adding new subelement mutations.
- [Automation](docs/automation.md): environment configuration, SFTP deployment, verification commands, and safeguards.
- [Development roadmap](docs/development-roadmap.md): phased path from documentation to scaffold, contract tooling, CLI, deployment, and verification.

## Reference Model

The plugin is implemented around one canonical operation layer:

```text
Canonical operation contract
    -> Moodle PHP operation classes
    -> REST external functions
    -> MCP tools/list and tools/call
    -> TypeScript client
    -> Node CLI commands
    -> parity tests
```

Operation names stay stable across transports in `snake_case`, for example `get_courses`, `create_module`, `update_question`, and `delete_folder_file`. Transport-specific names may wrap the canonical name:

- REST web service functions: `local_moodlia_get_courses`
- MCP tools: `get_courses`
- Node CLI commands: `moodle-mcp get-courses`
- Public npm CLI commands: `moodlia get-courses`
- TypeScript methods: `get_courses()` using the canonical operation name

## Current Implementation

The current implementation includes:

- Moodle local plugin scaffold under `plugin/moodlia`.
- REST external functions declared as `local_moodlia_*`.
- Moodle-hosted MCP endpoint at `/local/moodlia/mcp.php` with `tools/list` and `tools/call`.
- MCP token validation for `tools/list` and `tools/call` using the shared Moodle REST token.
- A machine-readable operation contract under `contract/operations.json`.
- Canonical enum constraints for supported enrolment role archetypes (`student`, `teacher`, `editingteacher`), module types (`assign`, `book`, `choice`, `data`, `feedback`, `lesson`, `lti`, `page`, `folder`, `forum`, `glossary`, `label`, `qbank`, `quiz`, `resource`, `subsection`, `url`, `wiki`, `workshop`), and question types (`truefalse`, `shortanswer`, `multichoice`, `numerical`, `essay`, `matching`, `description`, `randomsamatch`, `gapselect`, `ddwtos`, `ordering`, `multianswer`, `ddmarker`, `ddimageortext`, `calculatedsimple`, `calculated`, `calculatedmulti`).
- MCP tool schema parity manifest under `automation/manifests/mcp-tool-schemas.json`.
- Manifest generation from `contract/operations.json` through `npm run manifests:generate` and `npm run manifests:check`.
- Shared REST client at `client/moodle-rest-client.mjs` with TypeScript declarations in `client/moodle-rest-client.d.ts`.
- Generated per-operation TypeScript request/response declarations in `client/generated/operation-types.d.ts`, refreshed with `npm run types:generate` and checked with `npm run types:check`.
- Static parity checks for the contract, Moodle service declarations, CLI commands, generated TypeScript operation types, and forbidden direct database access patterns.
- Runtime transport parity checks compare REST, MCP, and CLI result shapes for stable read operations.
- REST smoke and write tests that generate their own Moodle course categories and courses, manage course calendar events, enrol and unenrol the configured user, manage groups and group membership, create Choice, Database, Feedback, Lesson, LTI, Book, Question bank, Subsection, and Workshop activities, verify common and module-specific completion rules, create/list/update/move/delete Book chapters, read Lesson access/page/grade/timer/attempt data and register Lesson views, manage Workshop phases, user plans, grades, grade reports, assessment reads, and submissions, create/list/update/delete Database fields and entries, list Feedback items, create forum discussions and replies, create/search/update/delete glossary entries, create/list/update wiki pages, list course assignments, save, submit, numerically grade assignment online-text submissions, configure and grade assignment rubrics/checklists/marking guides, verify gradebook items, user grades, course progress reports, and quiz results reports, and create all supported question types including embedded-choice, drag-and-drop, ordering, and calculated variants.
- MCP smoke and write lifecycle tests for course categories, courses, calendar events, enrolment, groups, module creation/update/duplication/move/deletion, Choice, Database field and entry operations, Feedback, Feedback item listing, Book chapter creation/listing/update/movement/deletion, Lesson, LTI, Question bank, Subsection, Workshop phases, user plans, grades, grade reports, assessment reads, and submissions, forum discussions and replies, glossary entries, wiki pages, course assignment listing, assignment online-text submissions and grades, assignment rubric/checklist/marking-guide grading, gradebook items and user grades, files, question categories, `truefalse`, `shortanswer`, `multichoice`, `numerical`, `essay`, and `matching` questions, quizzes, quiz attempts, and quiz results reports.
- MCP negative validation tests for missing bearer tokens, invalid tokens, unknown methods, unknown tools, invalid tool arguments, malformed JSON, invalid JSON-RPC envelopes, and non-POST requests.
- CLI smoke and write lifecycle tests for course categories, courses, calendar events, enrolment, groups, sections, assignment, course assignment listing, Book chapter creation/listing/update/movement/deletion and view registration, Choice, Database field and entry operations, Feedback, Feedback item listing, Lesson, LTI, Question bank, Subsection, Workshop phases, user plans, grades, grade reports, and submissions, page, label, URL, forum, glossary, wiki, file resource modules, duplicated modules, and moved modules, forum discussions and replies, glossary entries, wiki pages, assignment submissions, numeric grades, rubric/checklist/marking-guide grading, gradebook items and user grades, folder files, resource files, question categories, `truefalse`, `shortanswer`, `multichoice`, `numerical`, `essay`, and `matching` questions, quizzes, quiz attempts, and quiz results reports.
- CLI negative validation tests for unknown commands, unknown options, missing required options, invalid booleans, invalid numeric values, invalid ranges, and invalid JSON object parameters.
- CLI enum validation before REST calls for unsupported module and question types.
- Shared Node error normalization with `error`, `code`, `message`, and `details`, plus response-shape validation against operation `returns` contracts.
- MCP JSON-RPC errors expose the automation error contract under `error.data.code`; JSON-RPC `error.code` is protocol metadata.
- Playwright browser checks for Moodle login, course index visibility, generated course visibility, participants, groups, gradebook, activity subelements, files, question banks, quiz preview, and an in-progress quiz attempt.
- Node CLI at `cli/moodle-mcp.mjs` that maps contract operations to kebab-case commands, validates arguments through the shared contract parameter builder, and calls Moodle REST through the shared client.
- Generated public npm package at `packages/moodlia` with the `moodlia` binary, REST client, TypeScript declarations, filtered operation contract, README, and license.
- High-level course workflow operations for portable course blueprints, blueprint restore/application, course-structure copy, manual enrolment synchronisation, publish-state transitions, and course readiness audit.

REST, MCP, and the CLI use the same `MOODLE_REST_TOKEN`. The CLI does not call MCP; it uses `MOODLE_BASE_URL` and `MOODLE_REST_TOKEN`, then invokes Moodle's `/webservice/rest/server.php` endpoint with the matching `local_moodlia_*` function.

Example CLI commands:

```text
node cli/moodle-mcp.mjs get-current-user --format json
node cli/moodle-mcp.mjs get-courses --limit 5 --format json
node cli/moodle-mcp.mjs create-course-category --name "Generated Courses" --visible true --format json
node cli/moodle-mcp.mjs move-course --course-id 42 --category-id 12 --format json
node cli/moodle-mcp.mjs create-calendar-event --course-id 42 --name "Live session" --timestart 1893456000 --description "<p>Meet online.</p>" --format json
node cli/moodle-mcp.mjs enrol-user --course-id 42 --user-id 7 --role-archetype student --format json
node cli/moodle-mcp.mjs create-group --course-id 42 --name "Team A" --format json
node cli/moodle-mcp.mjs create-module --course-id 42 --section-number 1 --module-type page --name "Reading" --options "{\"content\":\"<p>Hello</p>\"}" --format json
node cli/moodle-mcp.mjs create-module --course-id 42 --section-number 0 --module-type qbank --name "MoodlIA Question Bank" --format json
node cli/moodle-mcp.mjs audit-course --course-id 42 --format json
node cli/moodle-mcp.mjs set-course-publish-state --course-id 42 --publish-state published --format json
```

After installing the public npm package, use the `moodlia` binary:

```text
moodlia get-current-user --format json
moodlia get-courses --limit 5 --format json
```

Object parameters such as `options`, `answers`, or `patch` are passed as JSON strings.

Use `--raw` or `--no-validate-response` only for advanced automation that needs to keep a usable Moodle response when a Moodle version returns nullable fields differently from the canonical response contract.

CLI successes are printed as JSON matching the canonical operation return contract. CLI failures are printed on stderr as JSON with `error`, `code`, `message`, and `details`.

## Generic Moodle Server Installation

MoodlIA installs like any standard Moodle local plugin: copy the packaged `moodlia` folder to `<moodle-root>/local/moodlia`, then run Moodle upgrade and purge caches from the Moodle root:

```text
npm run plugin:package
cp -a moodlia /var/www/html/local/moodlia
cd /var/www/html
php admin/cli/upgrade.php --non-interactive
php admin/cli/purge_caches.php
```

The repository's Docker/WinSCP scripts are for the configured development/staging target. They are not required for normal Moodle servers. Use `DEPLOY_MODE=direct` with `npm run deploy:commands` to print generic server commands from your environment file.

## Release And Demo Commands

Run the local release preflight:

```text
npm run release:check
```

GitHub Actions runs the local CI preflight on pushes and pull requests: npm package mirror drift, release checks, plugin packaging, and project website tests. Remote Moodle smoke/browser suites are intentionally not part of the default CI job because they need target-specific credentials and generate Moodle data.

Prepare and inspect the public npm package:

```text
npm run npm:sync
npm run npm:sync:check
npm run npm:pack:dry-run
```

Create a rich generated Moodle course without deleting existing courses:

```text
npm run moodle:create-demo-course
```

Audit generated Moodle test data without deleting it:

```text
npm run moodle:cleanup-generated
```

Delete only generated courses and empty generated course categories whose names match the MoodlIA test markers:

```text
npm run moodle:cleanup-generated:execute
```

Only on disposable Moodle instances, reset manageable courses before creating the demo course:

```text
npm run moodle:reset-full-course
```

## Moodle References

The design follows these official Moodle developer resources:

- Moodle API guides: https://moodledev.io/docs/5.0/apis
- External Services: https://moodledev.io/docs/5.0/apis/subsystems/external
- External function declarations: https://moodledev.io/docs/5.0/apis/subsystems/external/description
- External function definitions: https://moodledev.io/docs/4.1/apis/subsystems/external/functions
- Access API: https://moodledev.io/docs/4.5/apis/subsystems/access
- File API: https://moodledev.io/docs/5.1/apis/subsystems/files
- External file handling: https://moodledev.io/docs/5.0/apis/subsystems/external/files
- Data Manipulation API: https://moodledev.io/docs/5.0/apis/core/dml
- Data Definition API: https://moodledev.io/docs/4.4/apis/core/dml/ddl
- Component communication policy: https://moodledev.io/general/development/policies/component-communication
- Privacy API: https://moodledev.io/docs/5.2/apis/subsystems/privacy
- Plugin upgrades: https://moodledev.io/docs/5.3/guides/upgrade
- PHPUnit testing: https://moodledev.io/docs/5.3/guides/testing
- Behat: https://moodledev.io/general/development/tools/behat

## Implementation Rule

A new Moodle operation should not be considered complete until REST, MCP, CLI, and parity tests all derive from or validate against the same canonical operation contract. Browser tests verify Moodle-visible effects, but the Moodle plugin does not need its own operation UI.
