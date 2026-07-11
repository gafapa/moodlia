import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp } from '../helpers/mcp.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function callCli(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args] : args;
  const { stdout } = await execFileAsync(command, [...commandArgs, '--format', 'json'], {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

async function callMcpTool(name, toolArguments = {}) {
  return callMcp('tools/call', {
    name,
    arguments: toolArguments
  });
}

async function cleanup(operation, parameters) {
  try {
    await operation(parameters);
  } catch {
    // Smoke cleanup is best-effort so the original failure remains visible.
  }
}

test('user, cohort, and course role administration works through REST, MCP, and CLI', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const created = {
    userId: null,
    cohortId: null,
    categoryId: null,
    courseId: null
  };

  try {
    const user = await callRestFunction(restName('create_user'), {
      username: `moodliaadmin${suffix}`,
      firstname: 'MoodlIA',
      lastname: `Admin ${suffix}`,
      email: `moodlia-admin-${suffix}@example.edu`,
      password: `MoodliaAdmin${suffix}!Aa1`,
      suspended: 0
    });
    created.userId = user.user_id;
    assert.equal(user.username, `moodliaadmin${suffix}`);
    assert.equal(user.suspended, false);

    const userDetails = await callMcpTool('get_user_details', {
      user_id: created.userId
    });
    assert.equal(userDetails.user_id, created.userId);
    assert.equal(userDetails.email, `moodlia-admin-${suffix}@example.edu`);

    const updatedUser = await callCli([
      'update-user',
      '--user-id', String(created.userId),
      '--firstname', 'MoodlIA Updated',
      '--suspended', 'true'
    ]);
    assert.equal(updatedUser.user_id, created.userId);
    assert.equal(updatedUser.firstname, 'MoodlIA Updated');
    assert.equal(updatedUser.suspended, true);

    const cohort = await callRestFunction(restName('create_cohort'), {
      name: `MoodlIA Admin Cohort ${suffix}`,
      idnumber: `moodlia-admin-${suffix}`,
      visible: 1
    });
    created.cohortId = cohort.cohort_id;
    assert.equal(cohort.name, `MoodlIA Admin Cohort ${suffix}`);
    assert.equal(cohort.visible, true);

    const addedMember = await callMcpTool('add_cohort_member', {
      cohort_id: created.cohortId,
      user_id: created.userId
    });
    assert.equal(addedMember.member, true);

    const updatedCohort = await callCli([
      'update-cohort',
      '--cohort-id', String(created.cohortId),
      '--description', `<p>Updated ${suffix}</p>`,
      '--visible', 'false'
    ]);
    assert.equal(updatedCohort.cohort_id, created.cohortId);
    assert.equal(updatedCohort.visible, false);

    const removedMember = await callCli([
      'remove-cohort-member',
      '--cohort-id', String(created.cohortId),
      '--user-id', String(created.userId)
    ]);
    assert.equal(removedMember.member, false);

    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Admin Category ${suffix}`,
      visible: 0
    });
    created.categoryId = category.category_id;

    const course = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Admin Course ${suffix}`,
      shortname: `moodlia-admin-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      course_format: 'topics'
    });
    created.courseId = course.course_id;

    const assigned = await callMcpTool('assign_course_role', {
      course_id: created.courseId,
      user_id: created.userId,
      role_archetype: 'student'
    });
    assert.equal(assigned.assigned, true);
    assert.ok(assigned.roles.includes('student'));

    const unassigned = await callCli([
      'unassign-course-role',
      '--course-id', String(created.courseId),
      '--user-id', String(created.userId),
      '--role-archetype', 'student'
    ]);
    assert.equal(unassigned.unassigned, true);
    assert.ok(!unassigned.roles.includes('student'));
  } finally {
    if (created.courseId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_course'), parameters), {
        course_id: created.courseId
      });
    }
    if (created.categoryId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_course_category'), parameters), {
        category_id: created.categoryId
      });
    }
    if (created.cohortId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_cohort'), parameters), {
        cohort_id: created.cohortId
      });
    }
    if (created.userId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_user'), parameters), {
        user_id: created.userId
      });
    }
  }
});
