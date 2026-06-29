import assert from 'node:assert/strict';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';

const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

test('REST section functions are registered and validate required parameters', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();

  await assert.rejects(
    callRestFunction(toRestFunctionName(contract, 'create_section'), {
      name: 'MoodlIA missing course test'
    }),
    /invalidparameter|invalidrecordunknown|Missing required key|No se puede encontrar/i
  );
});
