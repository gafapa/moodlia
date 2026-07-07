import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { assertValidContract, loadContract } from '../helpers/contract.mjs';
import { fromRoot } from '../helpers/paths.mjs';

test('canonical operation contract is structurally valid', async () => {
  const contract = await loadContract();
  assertValidContract(contract);
});

test('workshop capability metadata matches published advanced assessment operations', async () => {
  const contract = await loadContract();
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));

  assert.equal(byName.get('evaluate_workshop_assessment')?.capability_mode, 'any');
  assert.deepEqual(byName.get('allocate_workshop_submission')?.target_capabilities?.reviewer_id, [
    'mod/workshop:peerassess'
  ]);

  const boundaries = await fs.readFile(fromRoot('docs/subelement-api-boundaries.md'), 'utf8');
  assert.doesNotMatch(boundaries, /Workshop allocations, grading form definition, assessment creation\/update\/evaluation/);
  assert.match(boundaries, /assessment updates, assessment evaluation/);
});

test('remaining high-risk subelement writes stay documented and unexposed until validated', async () => {
  const contract = await loadContract();
  const operationNames = new Set(contract.operations.map((operation) => operation.name));
  const boundaries = await fs.readFile(fromRoot('docs/subelement-api-boundaries.md'), 'utf8');
  const validation = await fs.readFile(fromRoot('docs/remaining-api-validation.md'), 'utf8');

  for (const operationName of [
    'create_workshop_assessment'
  ]) {
    assert.equal(
      operationNames.has(operationName),
      false,
      `${operationName} must not be exposed before an API boundary and smoke coverage are validated.`
    );
  }

  assert.match(boundaries, /Feedback item types beyond textfield, textarea, numeric, multichoice, multichoicerated, label, info, and pagebreak creation/);
  assert.match(boundaries, /Lesson question page mutation and unsupported answer\/jump payloads/);
  assert.match(boundaries, /Workshop grading form strategies beyond accumulative/);
  assert.match(boundaries, /\[remaining-api-validation\.md\]\(remaining-api-validation\.md\)/);

  for (const marker of [
    'feedback_get_item_class()',
    'Status: partially implemented for textfield, textarea, numeric, multichoice, multichoicerated, label, info, and pagebreak creation.',
    'Status: partially implemented for content pages.',
    'Status: partially implemented for the accumulative strategy.',
    'save_edit_strategy_form',
    'Required evidence before broadening implementation'
  ]) {
    assert.ok(validation.includes(marker), `remaining API validation docs must include ${marker}.`);
  }
});
