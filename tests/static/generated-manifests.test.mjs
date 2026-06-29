import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManifests } from '../../tools/generate-manifests.mjs';
import { loadContract, readJson } from '../helpers/contract.mjs';

test('generated manifest files are fresh from the canonical contract', async () => {
  const contract = await loadContract();
  const expected = buildManifests(contract);

  for (const [relativePath, manifest] of Object.entries(expected)) {
    const actual = await readJson(relativePath);
    assert.deepEqual(actual, manifest, `${relativePath} must be generated from contract/operations.json.`);
  }
});

