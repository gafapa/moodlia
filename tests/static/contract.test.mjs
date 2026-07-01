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
