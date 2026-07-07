# Remaining API Validation

MoodlIA intentionally avoids activity subelement writes unless Moodle exposes a stable component API path that can be validated through smoke tests. This note records the current validation status for the remaining high-risk areas from the seven-point implementation plan.

## Feedback Item Creation And Update

Status: not implemented.

Moodle 4.5 still exposes `feedback_get_item_class($typ)`, but `feedback_create_item()` is deprecated and throws a coding exception. The available creation flows in `mod/feedback/lib.php` create items by copying templates and writing `feedback_item` records directly. MoodlIA already supports Feedback module creation, item reads, page item reads, analysis reads, finished response reads, and item deletion; arbitrary item creation/update remains blocked until a stable writer API is validated.

Primary source:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/lib.php

Required evidence before implementation:

- A supported Moodle API or component helper that creates/updates item data without direct table writes from MoodlIA.
- Ownership validation that the item belongs to the selected Feedback activity.
- A smoke test that creates an item, verifies it through `get_feedback_items`, updates it, and verifies Moodle-visible state.

## Lesson Page Mutation

Status: partially implemented for content pages.

Moodle 4.5 has `lesson_page::create(...)`, `lesson_page::update(...)`, and page `delete()` methods. MoodlIA now exposes a narrow content-page contract that creates, updates, and deletes Lesson content pages and their branch jumps through those component APIs. The operation intentionally does not expose arbitrary Lesson question page types yet, because each page type has its own answer, scoring, file, and jump payload contract.

Primary source:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/lesson/locallib.php

Implemented evidence:

- Supported page type is limited to content pages with branch definitions.
- Ownership checks verify that every target page belongs to the selected Lesson module before update or delete.
- Static coverage requires contract, REST, MCP, CLI, services, helper APIs, and smoke syntax for create/update/delete.

Required evidence before broadening implementation:

- Supported schemas for each additional Lesson question page type.
- Smoke tests for scoring, jumps, files, and Moodle-visible rendering per page type.

## Workshop Grading Form Mutation

Status: not implemented.

Moodle Workshop grading-form subplugins expose strategy-specific `save_edit_strategy_form(...)` methods, but they write strategy tables such as `workshopform_rubric` and `workshopform_accumulative` internally and require form-shaped data. MoodlIA already supports phase management, user plans, submissions, allocation, assessment form reads, assessment updates, and assessment evaluation. Grading-form definition mutation remains blocked until the strategy-specific API contract is narrowed and smoke tested.

Primary sources:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/rubric/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/accumulative/lib.php

Required evidence before implementation:

- Supported strategy list and exact public payload schema per strategy.
- Capability and phase rules for mutating the form after submissions or assessments exist.
- A smoke test that writes a form definition, reads it back through `get_workshop_assessment_form_definition`, and verifies assessment updates still work.
