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

function ltiOptions(suffix, overrides = {}) {
  return {
    intro: `<p>MoodlIA LTI intro ${suffix}</p>`,
    tool_url: `https://example.com/moodlia/lti/${suffix}`,
    launch_container: 'embed_no_blocks',
    send_name: false,
    send_email: false,
    allow_roster: false,
    allow_setting: false,
    accept_grades: false,
    custom_parameters: `moodlia_suffix=${suffix}`,
    show_title_launch: true,
    show_description_launch: false,
    debug_launch: false,
    ...overrides
  };
}

function assertLtiDetails(details, created, expected) {
  const extra = JSON.parse(details.extra_json);

  assert.equal(details.module_type, 'lti');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(extra.activity.lti_id, created.instance_id);
  assert.equal(extra.activity.tool_url, expected.tool_url);
  assert.equal(extra.activity.launch_container, 3);
  assert.equal(extra.activity.send_name, expected.send_name);
  assert.equal(extra.activity.send_email, expected.send_email);
  assert.equal(extra.activity.allow_roster, expected.allow_roster);
  assert.equal(extra.activity.allow_setting, expected.allow_setting);
  assert.equal(extra.activity.accept_grades, expected.accept_grades);
  assert.equal(extra.activity.custom_parameters, expected.custom_parameters);
  assert.equal(extra.activity.show_title_launch, expected.show_title_launch);
  assert.equal(extra.activity.show_description_launch, expected.show_description_launch);
  assert.equal(extra.activity.debug_launch, expected.debug_launch);
  assert.equal(Object.hasOwn(extra.activity, 'shared_secret'), false);
  assert.equal(Object.hasOwn(extra.activity, 'password'), false);
}

test('LTI module lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA LTI Category ${suffix}`;
  const courseName = `MoodlIA LTI Course ${suffix}`;
  const courseShortname = `moodlia-lti-${suffix}`;
  const sectionName = `MoodlIA LTI Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restLtiDeleted = false;
  let mcpLtiDeleted = false;
  let cliLtiDeleted = false;
  let categoryDeleted = false;

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
      summary: `<p>MoodlIA LTI smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restOptions = ltiOptions(suffix);
    const restLti = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'lti',
      name: `MoodlIA REST LTI ${suffix}`,
      options: JSON.stringify(restOptions)
    });
    assert.equal(restLti.module_type, 'lti');
    assert.match(restLti.url, /\/mod\/lti\/view\.php\?id=/);

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restLti.course_module_id
    });
    assertLtiDetails(restDetails, restLti, restOptions);

    const mcpOptions = ltiOptions(suffix, {
      tool_url: `https://example.com/moodlia/lti/mcp/${suffix}`,
      show_title_launch: false
    });
    const mcpLti = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'lti',
      name: `MoodlIA MCP LTI ${suffix}`,
      options: mcpOptions
    });
    assert.equal(mcpLti.module_type, 'lti');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpLti.course_module_id
    });
    assertLtiDetails(mcpDetails, mcpLti, mcpOptions);

    const cliOptions = ltiOptions(suffix, {
      tool_url: `https://example.com/moodlia/lti/cli/${suffix}`,
      custom_parameters: `moodlia_suffix=${suffix}\ntransport=cli`
    });
    const cliLti = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'lti',
      '--name', `MoodlIA CLI LTI ${suffix}`,
      '--options', JSON.stringify(cliOptions)
    ]);
    assert.equal(cliLti.module_type, 'lti');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliLti.course_module_id)
    ]);
    assertLtiDetails(cliDetails, cliLti, cliOptions);

    const deletedCliLti = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliLti.course_module_id)
    ]);
    assert.equal(deletedCliLti.deleted, true);
    cliLtiDeleted = true;

    const deletedMcpLti = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpLti.course_module_id
    });
    assert.equal(deletedMcpLti.deleted, true);
    mcpLtiDeleted = true;

    const deletedRestLti = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restLti.course_module_id
    });
    assert.equal(deletedRestLti.deleted, true);
    restLtiDeleted = true;

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
    categoryDeleted = true;
    categoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated LTI course left in Moodle for inspection: ${courseId}`);
      if (!restLtiDeleted) {
        console.error('REST LTI cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!mcpLtiDeleted) {
        console.error('MCP LTI cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!cliLtiDeleted) {
        console.error('CLI LTI cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('LTI section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated LTI course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
