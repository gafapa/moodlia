# Activity Subelement API Boundaries

MoodlIA exposes activity subelements when Moodle provides a public API path that can validate context, capabilities, ownership, and side effects without raw SQL or plugin-owned tables.

## Implemented Subelement Areas

- Assignment submissions and grades through Moodle Assignment APIs.
- Book chapter listing and view registration through Moodle Book APIs.
- Book chapter creation, update, movement, and deletion through one audited Moodle Book DML boundary because Moodle Book has no public chapter writer API in the supported target. The boundary mirrors Moodle Book's own `edit.php`, `delete.php`, and `move.php` behavior and is the only approved exception to the usual no-DML rule.
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

1. Lesson page mutation, if Moodle's Lesson component exposes stable page and answer APIs.
2. Feedback item creation/update, only if Moodle exposes a stable non-table API for item creation.
3. Workshop grading form mutation, only after identifying stable Workshop APIs and capability boundaries.
