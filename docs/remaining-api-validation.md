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

Status: not implemented.

Moodle 4.5 has `lesson_page::create(...)`, but the implementation writes `lesson_pages`, updates neighbouring page links, and delegates answer creation to page-type classes. That may be a usable component boundary later, but it needs Moodle-version validation for page ordering, answer/jump payloads, events, and file editor handling before exposing it as REST/MCP/CLI.

Primary source:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/lesson/locallib.php

Required evidence before implementation:

- A narrow set of supported page types and answer/jump payload schemas.
- Ownership checks that every page belongs to the selected Lesson module.
- A smoke test that creates pages, verifies page order through `get_lesson_pages`, updates content/jumps, deletes a page, and confirms Moodle-visible state.

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
