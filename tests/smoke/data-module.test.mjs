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

function dataOptions(suffix, overrides = {}) {
  const availableFrom = Math.floor(Date.now() / 1000) - 60;
  return {
    intro: `<p>MoodlIA database intro ${suffix}</p>`,
    comments: false,
    approval_required: true,
    manage_approved: true,
    required_entries: 0,
    required_entries_to_view: 1,
    max_entries: 4,
    rss_articles: 0,
    available_from: availableFrom,
    available_to: availableFrom + 86400,
    view_from: availableFrom,
    view_to: availableFrom + 86400,
    default_sort_field_id: 0,
    default_sort_direction: 'ascending',
    edit_any: false,
    notification: 0,
    completion_entries: 0,
    ...overrides
  };
}

function assertDataDetails(details, created, expected) {
  const extra = JSON.parse(details.extra_json);

  assert.equal(details.module_type, 'data');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(extra.activity.data_id, created.instance_id);
  assert.equal(extra.activity.approval_required, expected.approval_required);
  assert.equal(extra.activity.manage_approved, expected.manage_approved);
  assert.equal(extra.activity.required_entries_to_view, expected.required_entries_to_view);
  assert.equal(extra.activity.max_entries, expected.max_entries);
  assert.equal(extra.activity.available_to > extra.activity.available_from, true);
  assert.equal(extra.activity.view_to > extra.activity.view_from, true);
  assert.equal(extra.activity.default_sort_direction, expected.default_sort_direction === 'descending' ? 1 : 0);
}

test('Database activity lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Data Category ${suffix}`;
  const courseName = `MoodlIA Data Course ${suffix}`;
  const courseShortname = `moodlia-data-${suffix}`;
  const sectionName = `MoodlIA Data Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restDataDeleted = false;
  let mcpDataDeleted = false;
  let cliDataDeleted = false;
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
      summary: `<p>MoodlIA data smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restOptions = dataOptions(suffix);
    const restData = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA REST Database ${suffix}`,
      options: JSON.stringify(restOptions)
    });
    assert.equal(restData.module_type, 'data');
    assert.match(restData.url, /\/mod\/data\/view\.php\?id=/);

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restData.course_module_id
    });
    assertDataDetails(restDetails, restData, restOptions);

    const mcpOptions = dataOptions(suffix, { max_entries: 6, required_entries_to_view: 2 });
    const mcpData = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA MCP Database ${suffix}`,
      options: mcpOptions
    });
    assert.equal(mcpData.module_type, 'data');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpData.course_module_id
    });
    assertDataDetails(mcpDetails, mcpData, mcpOptions);

    const cliOptions = dataOptions(suffix, {
      approval_required: false,
      manage_approved: false,
      default_sort_direction: 'descending'
    });
    const cliData = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'data',
      '--name', `MoodlIA CLI Database ${suffix}`,
      '--options', JSON.stringify(cliOptions)
    ]);
    assert.equal(cliData.module_type, 'data');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliData.course_module_id)
    ]);
    assertDataDetails(cliDetails, cliData, cliOptions);

    const deletedCliData = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliData.course_module_id)
    ]);
    assert.equal(deletedCliData.deleted, true);
    cliDataDeleted = true;

    const deletedMcpData = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpData.course_module_id
    });
    assert.equal(deletedMcpData.deleted, true);
    mcpDataDeleted = true;

    const deletedRestData = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restData.course_module_id
    });
    assert.equal(deletedRestData.deleted, true);
    restDataDeleted = true;

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
      console.error(`Generated data course left in Moodle for inspection: ${courseId}`);
      if (!restDataDeleted) {
        console.error('REST data cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!mcpDataDeleted) {
        console.error('MCP data cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!cliDataDeleted) {
        console.error('CLI data cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Data section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated data course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
