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

test('Choice activity lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Choice Smoke Category ${suffix}`;
  const courseName = `MoodlIA Choice Smoke Course ${suffix}`;
  const courseShortname = `moodlia-choice-smoke-${suffix}`;
  const sectionName = `MoodlIA Choice Smoke Section ${suffix}`;
  const choiceName = `MoodlIA Choice Smoke Activity ${suffix}`;
  const options = [
    `MoodlIA REST option ${suffix}`,
    `MoodlIA MCP option ${suffix}`,
    `MoodlIA CLI option ${suffix}`
  ];
  let category;
  let course;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: categoryName,
      visible: 1
    });
    course = await callRest('create_course', {
      fullname: courseName,
      shortname: courseShortname,
      category_id: category.category_id,
      visible: 1
    });
    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: sectionName,
      summary: 'Choice smoke section.'
    });
    const currentUser = await callRest('get_current_user');
    await callRest('enrol_user', {
      course_id: course.course_id,
      user_id: currentUser.id,
      role_archetype: 'student'
    });
    const choiceModule = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'choice',
      name: choiceName,
      options: JSON.stringify({
        intro: '<p>Choice smoke activity.</p>',
        choices: options,
        display: 'horizontal',
        allow_update: true,
        allow_multiple: false,
        limit_answers: true,
        limits: [5, 5, 5],
        show_available: true,
        show_preview: false,
        show_results: 'always',
        publish: 'anonymous',
        show_unanswered: true,
        include_inactive: false,
        time_open: Math.floor(Date.now() / 1000) - 60,
        time_close: Math.floor(Date.now() / 1000) + 86400
      })
    });

    const restOptions = await callRest('get_choice_options', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.deepEqual(
      restOptions.options.map((option) => option.text),
      options
    );

    const restCourseChoices = await callRest('get_course_choices', {
      course_id: course.course_id
    });
    assert.equal(restCourseChoices.course_id, course.course_id);
    assert.ok(restCourseChoices.choices.some((choice) => choice.choice_id === choiceModule.instance_id));

    const restView = await callRest('view_choice', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.equal(restView.viewed, true);

    const restOption = restOptions.options.find((option) => option.text === options[0]);
    await callRest('submit_choice_response', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id,
      option_ids: JSON.stringify([restOption.option_id])
    });
    const restResults = await callRest('get_choice_results', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.ok(restResults.results.some((result) => result.text === options[0]));

    const restDelete = await callRest('delete_choice_responses', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.equal(restDelete.deleted, true);

    const mcpOptions = await callMcpTool('get_choice_options', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    const mcpCourseChoices = await callMcpTool('get_course_choices', {
      course_id: course.course_id
    });
    assert.ok(mcpCourseChoices.choices.some((choice) => choice.choice_id === choiceModule.instance_id));

    const mcpView = await callMcpTool('view_choice', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.equal(mcpView.viewed, true);

    const mcpOption = mcpOptions.options.find((option) => option.text === options[1]);
    await callMcpTool('submit_choice_response', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id,
      option_ids: JSON.stringify([mcpOption.option_id])
    });
    const mcpResults = await callMcpTool('get_choice_results', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.ok(mcpResults.results.some((result) => result.text === options[1]));

    const mcpDelete = await callMcpTool('delete_choice_responses', {
      course_id: course.course_id,
      choice_module_id: choiceModule.course_module_id
    });
    assert.equal(mcpDelete.deleted, true);

    const cliOptions = await callCli([
      'get-choice-options',
      '--course-id', String(course.course_id),
      '--choice-module-id', String(choiceModule.course_module_id)
    ]);
    const cliCourseChoices = await callCli([
      'get-course-choices',
      '--course-id', String(course.course_id)
    ]);
    assert.ok(cliCourseChoices.choices.some((choice) => choice.choice_id === choiceModule.instance_id));

    const cliView = await callCli([
      'view-choice',
      '--course-id', String(course.course_id),
      '--choice-module-id', String(choiceModule.course_module_id)
    ]);
    assert.equal(cliView.viewed, true);

    const cliOption = cliOptions.options.find((option) => option.text === options[2]);
    await callCli([
      'submit-choice-response',
      '--course-id', String(course.course_id),
      '--choice-module-id', String(choiceModule.course_module_id),
      '--option-ids', JSON.stringify([cliOption.option_id])
    ]);
    const cliResults = await callCli([
      'get-choice-results',
      '--course-id', String(course.course_id),
      '--choice-module-id', String(choiceModule.course_module_id)
    ]);
    assert.ok(cliResults.results.some((result) => result.text === options[2]));

    const restChoiceDetails = await callRest('get_module_details', {
      course_id: course.course_id,
      module_id: choiceModule.course_module_id
    });
    const restChoiceExtra = JSON.parse(restChoiceDetails.extra_json);
    assert.equal(restChoiceDetails.module_type, 'choice');
    assert.equal(restChoiceExtra.activity.choice_id, choiceModule.instance_id);
    assert.equal(restChoiceExtra.activity.allowupdate, 1);
    assert.equal(restChoiceExtra.activity.allowmultiple, 0);
    assert.equal(restChoiceExtra.activity.limitanswers, 1);
    assert.equal(restChoiceExtra.activity.option_count, options.length);
    assert.deepEqual(
      restChoiceExtra.activity.options.map((option) => option.text),
      options
    );
    assert.ok(
      restChoiceExtra.activity.results.some((result) => result.text === options[2] && result.answer_count > 0),
      'choice module details must include the submitted CLI response in result totals'
    );

    const mcpChoiceDetails = await callMcpTool('get_module_details', {
      course_id: course.course_id,
      module_id: choiceModule.course_module_id
    });
    const mcpChoiceExtra = JSON.parse(mcpChoiceDetails.extra_json);
    assert.equal(mcpChoiceDetails.module_type, 'choice');
    assert.equal(mcpChoiceExtra.activity.choice_id, choiceModule.instance_id);
    assert.equal(mcpChoiceExtra.activity.option_count, options.length);
    assert.ok(mcpChoiceExtra.activity.total_responses > 0);

    const cliChoiceDetails = await callCli([
      'get-module-details',
      '--course-id', String(course.course_id),
      '--module-id', String(choiceModule.course_module_id)
    ]);
    const cliChoiceExtra = JSON.parse(cliChoiceDetails.extra_json);
    assert.equal(cliChoiceDetails.module_type, 'choice');
    assert.equal(cliChoiceExtra.activity.choice_id, choiceModule.instance_id);
    assert.equal(cliChoiceExtra.activity.option_count, options.length);
    assert.ok(cliChoiceExtra.activity.total_responses > 0);

    const cliDelete = await callCli([
      'delete-choice-responses',
      '--course-id', String(course.course_id),
      '--choice-module-id', String(choiceModule.course_module_id)
    ]);
    assert.equal(cliDelete.deleted, true);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Choice smoke course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Choice smoke category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
