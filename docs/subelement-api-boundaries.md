# Activity Subelement API Boundaries

MoodlIA exposes activity subelements when Moodle provides a public API path that can validate context, capabilities, ownership, and side effects without raw SQL or plugin-owned tables.

## Implemented Subelement Areas

- Assignment submissions and grades through Moodle Assignment APIs.
- Book chapter listing and view registration through Moodle Book APIs.
- Book chapter creation, update, movement, and deletion through one audited Moodle Book DML boundary because Moodle Book has no public chapter writer API in the supported target. The boundary mirrors Moodle Book's own `edit.php`, `delete.php`, and `move.php` behavior and is the only approved exception to the usual no-DML rule.
- Course activity-completion audit and repair through Moodle course-module APIs and MoodlIA's audited `update_module` path. This covers stale Book grade-completion rules and supports dry-run repair before changing Moodle state.
- Choice options, responses, and results through Moodle Choice APIs.
- Database fields and entries through Moodle Database APIs.
- Feedback item reads, page item reads, analysis reads, finished response reads, and item deletion through Moodle Feedback APIs.
- Folder and Resource file reads, downloads, and deletes through Moodle File API rules.
- Forum discussions, posts, and discussion state through Moodle Forum APIs.
- Glossary entries, categories, authors, browse filters, search, pending approval reads, and entry CRUD through Moodle Glossary APIs.
- Lesson page, jump, access, grade, timer, and attempt report reads through Moodle Lesson APIs.
- Quiz question slots, attempts, attempt data, attempt review, review options, grades, and view events through Moodle Quiz APIs.
- Wiki pages, subwikis, files, and view events through Moodle Wiki APIs.
- Workshop phases, user plans, grades, grade reports, reviewer/submission assessment reads, allocations, assessment form-definition reads, assessment updates, assessment evaluation, and submissions through Moodle Workshop APIs.

## Intentionally Not Exposed Yet

These areas remain blocked until a stable Moodle API path is identified and tested:

- Feedback question/item creation and arbitrary item updates.
- Lesson page creation, update, deletion, and answer/jump mutation.
- Workshop grading form mutation and standalone assessment creation outside Moodle's allocation flow.

## Required Standard Before Adding One

Every new subelement write must satisfy all of these conditions:

- It uses Moodle component APIs or external APIs, not raw SQL or plugin-owned tables. New `$DB` writes are blocked unless Moodle core has no public API for the target subelement and the implementation is isolated in a documented helper that mirrors the owning Moodle component's own behavior.
- It validates system context for `local/moodlia:useapi`.
- It validates course and module context before mutation.
- It verifies that the target subelement belongs to the selected activity.
- It checks the narrow Moodle capability required for the action.
- It returns a canonical shape shared by REST, MCP, and CLI.
- It has static parity coverage and at least one smoke test that confirms Moodle-visible state.
- It leaves generated courses behind on failure when that helps inspect broken state.

## Preferred Implementation Order

1. Feedback item creation/update, only after validating `feedback_get_item_class()` and `feedback_update_item()` across the supported Moodle versions with a smoke test that confirms UI-visible item state.
2. Lesson page mutation, only after validating the Lesson page and answer classes across the supported Moodle versions with ownership checks and a smoke test that confirms page order, jumps, and content.
3. Workshop grading form mutation, only after identifying stable Workshop grading-form subplugin APIs and capability boundaries.

See [remaining-api-validation.md](remaining-api-validation.md) for the current source-level validation notes and the evidence required before exposing these writes.
