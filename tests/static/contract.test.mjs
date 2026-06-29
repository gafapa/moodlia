import test from 'node:test';
import { assertValidContract, loadContract } from '../helpers/contract.mjs';

test('canonical operation contract is structurally valid', async () => {
  const contract = await loadContract();
  assertValidContract(contract);
});
