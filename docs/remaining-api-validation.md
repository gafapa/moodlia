# Remaining API Validation

MoodlIA intentionally avoids activity subelement writes unless Moodle exposes a stable component API path that can be validated through smoke tests. This note records the current validation status for the remaining high-risk areas from the seven-point implementation plan.

## Feedback Item Creation And Update

Status: partially implemented for textfield, textarea, numeric, multichoice, multichoicerated, label, info, captcha creation, and pagebreak creation.

Moodle 4.5 exposes item-type classes through `feedback_get_item_class()`. MoodlIA now exposes `create_feedback_item` and `update_feedback_item` for `textfield`, `textarea`, `numeric`, `multichoice`, `multichoicerated`, `label`, and `info`. Captcha creation is exposed as a narrow create-only operation through Moodle's `feedback_item_captcha` class; updates, duplicate captcha items, non-empty definitions, optional dependencies, and non-required captcha settings are rejected before Moodle can reach the item class `notice()/exit` paths. Pagebreak creation uses Moodle's `feedback_create_pagebreak()` helper, matching the component edit UI. The operation builds a narrow type-specific payload and delegates persistence to Moodle's item class via `build_editform()`, `set_data()`, and `save_item()` where the item type has a writer class. Position changes use Moodle's `feedback_move_item()` and `feedback_renumber_items()`. MoodlIA does not write `feedback_item` tables directly.

Primary sources:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/edit_item.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/feedback_item_class.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/textfield/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/textarea/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/numeric/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/multichoice/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/multichoicerated/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/label/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/info/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/feedback/item/captcha/lib.php

Implemented evidence:

- Supported item types are limited to `textfield`, `textarea`, `numeric`, `multichoice`, `multichoicerated`, `label`, `info`, captcha creation, and pagebreak creation.
- Mutation requires `mod/feedback:edititems`.
- Ownership validation verifies that referenced item ids belong to the selected Feedback activity.
- Persistence goes through Moodle item classes and type-specific `save_item()` methods.
- Static coverage verifies contract, REST, MCP, CLI, services, capabilities, and no direct `$DB` usage in MoodlIA's operation boundary.

Required evidence before broadening implementation:

- Type-specific payload contracts for any additional item type available in a target Moodle version, such as captcha when installed/enabled.
- Smoke coverage for each additional supported type.
- Evidence that updating items after responses exist preserves Moodle response-value semantics.

## Lesson Page Mutation

Status: partially implemented for content pages, truefalse question pages, and multichoice question pages.

Moodle 4.5 has `lesson_page::create(...)`, `lesson_page::update(...)`, and page `delete()` methods. MoodlIA now exposes a narrow content-page contract that creates, updates, and deletes Lesson content pages and their branch jumps through those component APIs. It also exposes truefalse question-page creation and update through the same page component APIs, using exactly two answer editors, response editors, jumps, and scores. The operation intentionally does not expose arbitrary Lesson question page types yet, because each page type has its own answer, scoring, file, and jump payload contract.

Primary sources:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/lesson/locallib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/lesson/pagetypes/truefalse.php

Implemented evidence:

- Supported page types are limited to content pages with branch definitions, truefalse question pages with exactly two answers, and multichoice question pages with single-answer or multi-answer choices.
- Truefalse answer payloads validate non-empty unique answer text, response text, Moodle text formats, jump targets, and numeric scores before delegating to Moodle's page APIs.
- Ownership checks verify that every target page belongs to the selected Lesson module before update or delete.
- Static coverage requires contract, REST, MCP, CLI, services, helper APIs, and smoke syntax for content and truefalse create/update/delete.

Required evidence before broadening implementation:

- Supported schemas for each additional Lesson question page type.
- Smoke tests for scoring, jumps, files, and Moodle-visible rendering per page type.

## Workshop Grading Form Mutation

Status: partially implemented for the accumulative, comments, number-of-errors, and rubric strategies.

Moodle Workshop grading-form subplugins expose strategy-specific `save_edit_strategy_form(...)` methods. MoodlIA now exposes `set_workshop_grading_form` for the active `accumulative`, `comments`, `numerrors`, and `rubric` strategies in setup phase only. The operation builds the form-shaped data required by Moodle and delegates persistence to the Workshop strategy instance instead of writing `workshopform_accumulative`, `workshopform_comments`, `workshopform_numerrors`, or `workshopform_rubric` tables directly. Number-of-errors writes include the dimension assertions and error-count grade mapping expected by Moodle's strategy form. Rubric replacement includes existing dimension and level ids from the Moodle strategy object so the subplugin can delete old rows through its own save path. Other strategies remain blocked until their payload contracts are narrowed and smoke tested.

Primary sources:

- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/rubric/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/numerrors/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/accumulative/lib.php
- https://raw.githubusercontent.com/moodle/moodle/MOODLE_405_STABLE/mod/workshop/form/comments/lib.php

Implemented evidence:

- Supported strategies are limited to `accumulative`, `comments`, `numerrors`, and `rubric`.
- Mutation requires setup phase and `mod/workshop:editdimensions`.
- Persistence goes through `grading_strategy_instance()->save_edit_strategy_form(...)`.
- Static coverage verifies contract, REST, MCP, CLI, services, capabilities, and no direct `$DB` usage in the operation.

Required evidence before broadening implementation:

- Exact public payload schema per additional strategy.
- Capability and phase rules for mutating the form after submissions or assessments exist.
- A smoke test that writes a form definition, reads it back through `get_workshop_assessment_form_definition`, and verifies assessment updates still work.
