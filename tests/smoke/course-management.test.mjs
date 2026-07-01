import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
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

test('course movement and section writes work through REST and CLI', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Course Management Category ${suffix}`;
  const created = {
    categoryId: null,
    courseId: null
  };
  let completed = false;

  const restName = (operationName) => toRestFunctionName(contract, operationName);

  try {
    const category = await callRestFunction(restName('create_course_category'), {
      name: categoryName,
      visible: 1
    });
    created.categoryId = category.category_id;
    assert.equal(category.created, true);

    const reusedCategory = await callRestFunction(restName('create_course_category'), {
      name: categoryName,
      visible: 1,
      reuse_existing: 1
    });
    assert.equal(reusedCategory.category_id, created.categoryId);
    assert.equal(reusedCategory.created, false);

    const course = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Course Management Course ${suffix}`,
      shortname: `moodlia-course-management-${suffix}`,
      visible: 0,
      summary: `<p>MoodlIA course management smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    created.courseId = course.course_id;
    const originalCategoryId = course.category_id;

    const restMove = await callRestFunction(restName('move_course'), {
      course_id: created.courseId,
      category_id: created.categoryId
    });
    assert.equal(restMove.category_id, created.categoryId);
    assert.equal(restMove.moved, true);

    const movedBack = await callRestFunction(restName('update_course'), {
      course_id: created.courseId,
      category_id: originalCategoryId
    });
    assert.equal(movedBack.category_id, originalCategoryId);

    const cliMove = await callCli([
      'move-course',
      '--course-id', String(created.courseId),
      '--category-id', String(created.categoryId)
    ]);
    assert.equal(cliMove.category_id, created.categoryId);
    assert.equal(cliMove.moved, true);

    const section = await callRestFunction(restName('create_section'), {
      course_id: created.courseId,
      name: `MoodlIA Managed Section ${suffix}`,
      summary: 'Created by the course-management smoke test.'
    });
    assert.equal(section.course_id, created.courseId);
    assert.equal(section.section_number > 0, true);

    const updatedByNumber = await callRestFunction(restName('update_section'), {
      course_id: created.courseId,
      section_number: section.section_number,
      name: `MoodlIA Managed Section Updated ${suffix}`
    });
    assert.equal(updatedByNumber.section_id, section.section_id);
    assert.equal(updatedByNumber.section_number, section.section_number);

    const updatedById = await callRestFunction(restName('update_section'), {
      course_id: created.courseId,
      section_id: section.section_id,
      visible: 0
    });
    assert.equal(updatedById.visible, false);

    completed = true;
  } finally {
    if (completed && created.courseId !== null) {
      await callRestFunction(restName('delete_course'), {
        course_id: created.courseId
      });
    }

    if (completed && created.categoryId !== null) {
      await callRestFunction(restName('delete_course_category'), {
        category_id: created.categoryId
      });
    }
  }
});
