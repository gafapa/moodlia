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

test('advanced gradebook category, item, and grade value lifecycle works through REST, MCP, and CLI', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const created = {
    userId: null,
    categoryId: null,
    courseId: null,
    gradeCategoryId: null,
    gradeItemId: null
  };

  try {
    const user = await callRestFunction(restName('create_user'), {
      username: `moodliagrade${suffix}`,
      firstname: 'MoodlIA',
      lastname: `Grade ${suffix}`,
      email: `moodlia-grade-${suffix}@example.edu`,
      password: `MoodliaGrade${suffix}!Aa1`
    });
    created.userId = user.user_id;

    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Gradebook Category ${suffix}`,
      visible: 0
    });
    created.categoryId = category.category_id;

    const course = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Gradebook Course ${suffix}`,
      shortname: `moodlia-gradebook-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      course_format: 'topics'
    });
    created.courseId = course.course_id;

    await callRestFunction(restName('enrol_user'), {
      course_id: created.courseId,
      user_id: created.userId,
      role_archetype: 'student'
    });

    const gradeCategory = await callRestFunction(restName('create_grade_category'), {
      course_id: created.courseId,
      name: `Portfolio ${suffix}`
    });
    created.gradeCategoryId = gradeCategory.category_id;
    assert.equal(gradeCategory.course_id, created.courseId);

    const categories = await callMcpTool('get_grade_categories', {
      course_id: created.courseId
    });
    assert.ok(categories.categories.some((entry) => entry.category_id === created.gradeCategoryId));

    const gradeItem = await callMcpTool('create_grade_item', {
      course_id: created.courseId,
      category_id: created.gradeCategoryId,
      name: `Participation ${suffix}`,
      grade_max: 10,
      grade_min: 0,
      grade_pass: 5
    });
    created.gradeItemId = gradeItem.item_id;
    assert.equal(gradeItem.item_type, 'manual');
    assert.equal(gradeItem.category_id, created.gradeCategoryId);

    const updatedItem = await callCli([
      'update-grade-item',
      '--course-id', String(created.courseId),
      '--item-id', String(created.gradeItemId),
      '--name', `Participation Updated ${suffix}`,
      '--grade-max', '20',
      '--hidden', 'false'
    ]);
    assert.equal(updatedItem.grade_max, 20);
    assert.equal(updatedItem.hidden, false);

    const gradeValue = await callRestFunction(restName('update_grade_value'), {
      course_id: created.courseId,
      item_id: created.gradeItemId,
      user_id: created.userId,
      grade: 18,
      feedback: '<p>Strong work.</p>'
    });
    assert.equal(gradeValue.updated, true);
    assert.equal(gradeValue.grade, 18);

    const grades = await callRestFunction(restName('get_user_grades'), {
      course_id: created.courseId,
      user_id: created.userId
    });
    assert.ok(grades.items.some((entry) => entry.item_id === created.gradeItemId));
  } finally {
    if (created.gradeItemId !== null && created.courseId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_grade_item'), parameters), {
        course_id: created.courseId,
        item_id: created.gradeItemId
      });
    }
    if (created.gradeCategoryId !== null && created.courseId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_grade_category'), parameters), {
        course_id: created.courseId,
        category_id: created.gradeCategoryId
      });
    }
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
    if (created.userId !== null) {
      await cleanup((parameters) => callRestFunction(restName('delete_user'), parameters), {
        user_id: created.userId
      });
    }
  }
});
