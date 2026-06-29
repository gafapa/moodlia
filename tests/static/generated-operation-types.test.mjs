import test from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);

test('generated operation type declarations are fresh from the canonical contract', async () => {
  await execFileAsync(process.execPath, [fromRoot('tools/generate-operation-types.mjs'), '--check'], {
    cwd: fromRoot('.')
  });
});
