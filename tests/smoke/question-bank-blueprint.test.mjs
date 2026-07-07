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

test('question bank blueprint export and import works through REST, MCP, and CLI', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const created = {
    categoryId: null,
    courseId: null,
    qbankModuleId: null
  };

  try {
    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Question Blueprint Category ${suffix}`,
      visible: 0
    });
    created.categoryId = category.category_id;

    const course = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Question Blueprint Course ${suffix}`,
      shortname: `moodlia-question-blueprint-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      course_format: 'topics'
    });
    created.courseId = course.course_id;

    const qbank = await callRestFunction(restName('create_module'), {
      course_id: created.courseId,
      section_number: 0,
      module_type: 'qbank',
      name: `MoodlIA Question Bank ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Question blueprint smoke bank.</p>'
      })
    });
    created.qbankModuleId = qbank.module_id;

    const sourceCategory = await callRestFunction(restName('create_question_category'), {
      course_id: created.courseId,
      name: `Source ${suffix}`,
      bank_scope: 'course_shared',
      question_bank_module_id: created.qbankModuleId
    });

    await callRestFunction(restName('create_question'), {
      category_id: sourceCategory.category_id,
      context_id: sourceCategory.context_id,
      question_type: 'truefalse',
      name: `True False ${suffix}`,
      question_text: '<p>Moodle is a learning platform.</p>',
      options: JSON.stringify({
        correct_answer: true,
        default_mark: 1
      })
    });

    await callRestFunction(restName('create_question'), {
      category_id: sourceCategory.category_id,
      context_id: sourceCategory.context_id,
      question_type: 'shortanswer',
      name: `Short Answer ${suffix}`,
      question_text: '<p>Type MoodlIA.</p>',
      options: JSON.stringify({
        answers: [
          {
            text: 'MoodlIA',
            fraction: 1
          }
        ],
        default_mark: 1
      })
    });

    const exported = await callMcpTool('export_question_bank_blueprint', {
      course_id: created.courseId,
      bank_scope: 'course_shared',
      question_bank_module_id: created.qbankModuleId,
      category_id: sourceCategory.category_id,
      include_unsupported: false
    });
    assert.equal(exported.question_count, 2);
    const blueprint = JSON.parse(exported.blueprint_json);
    assert.equal(blueprint.schema, 'moodlia.question_bank_blueprint.v1');
    assert.equal(blueprint.categories.length, 1);

    const imported = await callCli([
      'import-question-bank-blueprint',
      '--course-id', String(created.courseId),
      '--blueprint-json', exported.blueprint_json,
      '--bank-scope', 'course_shared',
      '--question-bank-module-id', String(created.qbankModuleId),
      '--create-categories', 'true'
    ]);
    assert.equal(imported.created_category_count, 1);
    assert.equal(imported.created_question_count, 2);

    const createdQuestions = JSON.parse(imported.created_questions_json);
    assert.equal(createdQuestions.length, 2);
    assert.ok(createdQuestions.some((question) => question.question_type === 'truefalse'));
    assert.ok(createdQuestions.some((question) => question.question_type === 'shortanswer'));
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
  }
});
