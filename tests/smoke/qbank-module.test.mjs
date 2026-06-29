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
const hasConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

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

function assertQbankDetails(details, created) {
  assert.equal(details.module_type, 'qbank');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(details.instance_id, created.instance_id);

  const extra = JSON.parse(details.extra_json);
  assert.equal(extra.activity.qbank_id, created.instance_id);
  assert.equal(extra.activity.question_bank_module_id, created.course_module_id);
  assert.equal(typeof extra.activity.context_id, 'number');
  assert.equal(extra.activity.context_id > 0, true);
  assert.match(extra.activity.url, /\/question\/edit\.php\?cmid=/);
  assert.equal(typeof extra.activity.category_count, 'number');
  assert.equal(typeof extra.activity.question_count, 'number');
  assert.equal(Array.isArray(extra.activity.categories), true);
}

test('Question bank module creation works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA QBank Category ${suffix}`;
  const courseName = `MoodlIA QBank Course ${suffix}`;
  const courseShortname = `moodlia-qbank-${suffix}`;
  const sectionName = `MoodlIA QBank Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let questionCategoryId = null;
  let sectionDeleted = false;
  let restQbankDeleted = false;
  let mcpQbankDeleted = false;
  let cliQbankDeleted = false;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: categoryName,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: courseName,
      shortname: courseShortname,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA qbank smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restQbank = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA REST QBank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>REST-created question bank.</p>',
        visible: true,
        show_description: true
      })
    });
    assert.equal(restQbank.module_type, 'qbank');

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restQbank.course_module_id
    });
    assertQbankDetails(restDetails, restQbank);

    const listedBanks = await callRestFunction(toRestFunctionName(contract, 'get_question_banks'), {
      course_id: courseId,
      include_quiz_private: false
    });
    assert.ok(
      listedBanks.banks.some((bank) => bank.question_bank_module_id === restQbank.course_module_id),
      'created qbank must appear in get_question_banks'
    );

    const questionCategory = await callRestFunction(toRestFunctionName(contract, 'create_question_category'), {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: restQbank.course_module_id,
      name: `MoodlIA REST QBank Question Category ${suffix}`,
      description: 'Created in an explicit qbank module.'
    });
    questionCategoryId = questionCategory.category_id;
    const questionCategoryContextId = questionCategory.context_id;
    assert.equal(questionCategory.question_bank_module_id, restQbank.course_module_id);

    const listedCategories = await callRestFunction(toRestFunctionName(contract, 'get_question_categories'), {
      course_id: courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: restQbank.course_module_id,
      include_top: true
    });
    assert.ok(
      listedCategories.categories.some((category) => category.category_id === questionCategoryId),
      'created qbank question category must be listed'
    );

    const mcpQbank = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA MCP QBank ${suffix}`,
      options: {
        intro: '<p>MCP-created question bank.</p>',
        visible: true
      }
    });
    assert.equal(mcpQbank.module_type, 'qbank');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpQbank.course_module_id
    });
    assertQbankDetails(mcpDetails, mcpQbank);

    const cliQbank = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', '0',
      '--module-type', 'qbank',
      '--name', `MoodlIA CLI QBank ${suffix}`,
      '--options', JSON.stringify({
        intro: '<p>CLI-created question bank.</p>',
        visible: true
      })
    ]);
    assert.equal(cliQbank.module_type, 'qbank');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliQbank.course_module_id)
    ]);
    assertQbankDetails(cliDetails, cliQbank);

    const deletedQuestionCategory = await callRestFunction(toRestFunctionName(contract, 'delete_question_category'), {
      category_id: questionCategoryId,
      context_id: questionCategoryContextId,
      delete_mode: 'delete'
    });
    assert.equal(deletedQuestionCategory.deleted, true);
    questionCategoryId = null;

    const deletedCliQbank = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliQbank.course_module_id)
    ]);
    assert.equal(deletedCliQbank.deleted, true);
    cliQbankDeleted = true;

    const deletedMcpQbank = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpQbank.course_module_id
    });
    assert.equal(deletedMcpQbank.deleted, true);
    mcpQbankDeleted = true;

    const deletedRestQbank = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restQbank.course_module_id
    });
    assert.equal(deletedRestQbank.deleted, true);
    restQbankDeleted = true;

    const deletedSection = await callRestFunction(toRestFunctionName(contract, 'delete_section'), {
      course_id: courseId,
      section_id: section.section_id
    });
    assert.equal(deletedSection.deleted, true);
    sectionDeleted = true;

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryId = null;
  } finally {
    if (courseId !== null) {
      if (questionCategoryId !== null) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
      if (!cliQbankDeleted || !mcpQbankDeleted || !restQbankDeleted || !sectionDeleted) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
    } else if (categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
    }
  }
});
