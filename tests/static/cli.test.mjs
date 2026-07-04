import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);

async function callCliFailure(args) {
  try {
    await execFileAsync(process.execPath, [fromRoot('cli/moodle-mcp.mjs'), ...args], {
      timeout: 10000,
      env: {
        ...process.env,
        MOODLE_BASE_URL: '',
        MOODLE_REST_TOKEN: ''
      }
    });
  } catch (error) {
    const rawError = (error.stderr || error.stdout || '').trim();
    assert.ok(rawError, 'CLI failures must print a JSON error payload.');
    return JSON.parse(rawError);
  }

  assert.fail('CLI command was expected to fail.');
}

async function callCli(args) {
  const { stdout } = await execFileAsync(process.execPath, [fromRoot('cli/moodle-mcp.mjs'), ...args], {
    timeout: 10000,
    env: {
      ...process.env,
      MOODLE_BASE_URL: '',
      MOODLE_REST_TOKEN: ''
    }
  });

  return stdout;
}

test('CLI rejects unknown operation options before transport creation', async () => {
  const payload = await callCliFailure(['get-courses', '--unknown-option', 'value']);

  assert.equal(payload.error, true);
  assert.equal(payload.code, 'invalid_parameters');
  assert.equal(payload.details.operation, 'get_courses');
  assert.equal(payload.details.parameter, 'unknown_option');
  assert.match(payload.message, /Unknown option --unknown-option for get-courses/);
});

test('CLI uses shared strict integer validation before transport creation', async () => {
  const payload = await callCliFailure(['get-courses', '--limit', '5abc']);

  assert.equal(payload.error, true);
  assert.equal(payload.code, 'invalid_parameters');
  assert.equal(payload.details.parameter, 'limit');
  assert.match(payload.message, /limit must be an integer/);
});

test('CLI operation help exposes enum, range, JSON object, and format metadata', async () => {
  const getCoursesHelp = await callCli(['get-courses', '--help']);
  assert.match(getCoursesHelp, /--limit <integer>\s+optional; min: 1/);
  assert.match(getCoursesHelp, /--format <string>\s+optional; one of: json/);
  assert.match(getCoursesHelp, /--no-validate-response\s+optional; skip contract response validation/);
  assert.match(getCoursesHelp, /--raw\s+optional; alias for --no-validate-response/);

  const createModuleHelp = await callCli(['create-module', '--help']);
  assert.match(createModuleHelp, /--module-type <string>\s+required; one of: assign, book, choice/);
  assert.match(createModuleHelp, /--options <object>\s+optional; JSON object/);

  const moveCourseHelp = await callCli(['move-course', '--help']);
  assert.match(moveCourseHelp, /--course-id <integer>\s+required/);
  assert.match(moveCourseHelp, /--category-id <integer>\s+required/);
});

test('CLI accepts response validation bypass flags as global options', async () => {
  const payload = await callCliFailure(['get-courses', '--raw']);

  assert.equal(payload.error, true);
  assert.equal(payload.code, 'invalid_parameters');
  assert.match(payload.message, /MOODLE_BASE_URL and MOODLE_REST_TOKEN are required/);

  const payloadWithLongFlag = await callCliFailure(['get-courses', '--no-validate-response']);
  assert.equal(payloadWithLongFlag.error, true);
  assert.equal(payloadWithLongFlag.code, 'invalid_parameters');
  assert.match(payloadWithLongFlag.message, /MOODLE_BASE_URL and MOODLE_REST_TOKEN are required/);
});

test('CLI accepts quiz course id aliases before transport creation', async () => {
  const payloadWithCourseId = await callCliFailure(['get-course-quizzes', '--course-id', '2206']);

  assert.equal(payloadWithCourseId.error, true);
  assert.equal(payloadWithCourseId.code, 'invalid_parameters');
  assert.match(payloadWithCourseId.message, /MOODLE_BASE_URL and MOODLE_REST_TOKEN are required/);

  const payloadWithScalarCourseIds = await callCliFailure(['get-course-quizzes', '--course-ids', '2206']);

  assert.equal(payloadWithScalarCourseIds.error, true);
  assert.equal(payloadWithScalarCourseIds.code, 'invalid_parameters');
  assert.match(payloadWithScalarCourseIds.message, /MOODLE_BASE_URL and MOODLE_REST_TOKEN are required/);
});
