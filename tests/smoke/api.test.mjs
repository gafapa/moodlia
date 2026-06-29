import assert from 'node:assert/strict';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';

const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

test('REST smoke: get_current_user responds', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const result = await callRestFunction(toRestFunctionName(contract, 'get_current_user'));

  assert.equal(typeof result, 'object');
  assert.ok(result.id || result.userid || result.username, 'REST current user response should include user identity.');
});

test('REST smoke: get_courses responds', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const result = await callRestFunction(toRestFunctionName(contract, 'get_courses'));

  assert.ok(Array.isArray(result) || Array.isArray(result?.courses), 'REST course response should include a course list.');
});
