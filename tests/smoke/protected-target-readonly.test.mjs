import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp, callMcpRaw } from '../helpers/mcp.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasProtectedConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function callMcpTool(name, toolArguments = {}) {
  return callMcp('tools/call', {
    name,
    arguments: toolArguments
  });
}

async function callCli(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args, '--format', 'json'] : [...args, '--format', 'json'];
  const { stdout } = await execFileAsync(command, commandArgs, {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

function normalizeUser(user) {
  return {
    username: String(user.username ?? ''),
    site_url: String(user.site_url ?? '')
  };
}

function normalizeCourses(payload) {
  const courses = Array.isArray(payload) ? payload : payload?.courses;
  assert.ok(Array.isArray(courses), 'course payload must expose a course array');
  return courses.map((course) => ({
    course_id: Number(course.course_id ?? course.id),
    shortname: String(course.shortname ?? ''),
    fullname: String(course.fullname ?? '')
  }));
}

test('protected target read-only gate checks REST, MCP, and CLI without Moodle writes', {
  skip: !hasProtectedConfig
}, async () => {
  const contract = await loadContract();

  const restStatus = await callRestFunction(toRestFunctionName(contract, 'get_moodlia_status'));
  assert.equal(restStatus.component, 'local_moodlia');
  assert.equal(restStatus.can_use_api, true);
  assert.ok(restStatus.function_count > 0);

  const restUser = normalizeUser(await callRestFunction(toRestFunctionName(contract, 'get_current_user')));
  const mcpUser = normalizeUser(await callMcpTool('get_current_user'));
  const cliUser = normalizeUser(await callCli(['get-current-user']));
  assert.deepEqual(mcpUser, restUser);
  assert.deepEqual(cliUser, restUser);

  const limit = 3;
  const restCourses = normalizeCourses(await callRestFunction(toRestFunctionName(contract, 'get_courses'), { limit }));
  const mcpCourses = normalizeCourses(await callMcpTool('get_courses', { limit }));
  const cliCourses = normalizeCourses(await callCli(['get-courses', '--limit', String(limit)]));
  assert.ok(restCourses.length <= limit);
  assert.deepEqual(mcpCourses, restCourses);
  assert.deepEqual(cliCourses, restCourses);

  const toolsResult = await callMcp('tools/list');
  const tools = toolsResult?.tools ?? toolsResult;
  const toolNames = tools.map((tool) => tool.name ?? tool);
  for (const name of ['get_current_user', 'get_moodlia_status', 'get_courses']) {
    assert.ok(toolNames.includes(name), `MCP tools/list must include ${name}.`);
  }

  const missingToken = await callMcpRaw({
    method: 'tools/list',
    includeAuthorization: false
  });
  assert.equal(missingToken.response.status, 401);
  assert.equal(missingToken.body.error.data.code, 'missing_capability');
});
