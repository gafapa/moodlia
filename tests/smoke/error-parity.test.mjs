import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { createMoodleRestClient, MoodleClientError } from '../../client/moodle-rest-client.mjs';
import { getEnv, requireEnv } from '../helpers/env.mjs';
import { loadContract } from '../helpers/contract.mjs';
import { callMcpRaw } from '../helpers/mcp.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function callCliFailure(args) {
  try {
    await execFileAsync(process.execPath, [fromRoot('cli/moodle-mcp.mjs'), ...args], {
      timeout: 10000,
      env: {
        ...process.env,
        MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
        MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
      }
    });
  } catch (error) {
    return JSON.parse((error.stderr || error.stdout || '').trim());
  }

  assert.fail('CLI command was expected to fail.');
}

test('invalid get_courses limit reports a canonical error code across REST client, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const restClient = createMoodleRestClient({
    baseUrl: getEnv('MOODLE_BASE_URL'),
    token: getEnv('MOODLE_REST_TOKEN'),
    contract
  });

  await assert.rejects(
    () => restClient.get_courses({ limit: '5abc' }),
    (error) => {
      assert.ok(error instanceof MoodleClientError);
      assert.equal(error.code, 'invalid_parameters');
      assert.equal(error.details.parameter, 'limit');
      return true;
    }
  );

  const cliError = await callCliFailure(['get-courses', '--limit', '5abc', '--format', 'json']);
  assert.equal(cliError.code, 'invalid_parameters');
  assert.equal(cliError.details.parameter, 'limit');

  const mcpError = await callMcpRaw({
    method: 'tools/call',
    params: {
      name: 'get_courses',
      arguments: {
        limit: '5abc'
      }
    }
  });
  assert.equal(mcpError.response.status, 200);
  assert.equal(mcpError.body.error.data.code, 'invalid_parameters');
  assert.equal(mcpError.body.error.data.details.moodle_errorcode, 'invalidparameter');
});
