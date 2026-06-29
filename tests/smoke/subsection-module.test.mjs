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

function assertSubsectionDetails(details, created) {
  assert.equal(details.module_type, 'subsection');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(details.instance_id, created.instance_id);

  const extra = JSON.parse(details.extra_json);
  assert.equal(extra.activity.subsection_id, created.instance_id);
  assert.equal(typeof extra.activity.delegated_section_id, 'number');
  assert.equal(extra.activity.delegated_section_id > 0, true);
  assert.equal(typeof extra.activity.delegated_section_number, 'number');
  assert.equal(extra.activity.delegated_section_name, created.name);
  assert.equal(typeof extra.activity.delegated_section_visible, 'boolean');
  assert.equal(typeof extra.activity.delegated_section_availability, 'string');
}

function assertCourseContentsInclude(contents, created, sourceSectionNumber) {
  const sourceSection = contents.sections.find((section) => section.section_number === sourceSectionNumber);
  const subsectionModule = sourceSection?.modules.find((module) => module.course_module_id === created.course_module_id);
  assert.equal(subsectionModule?.module_type, 'subsection');
  assert.equal(subsectionModule?.name, created.name);
}

test('Subsection module creation exposes delegated course structure through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Subsection Category ${suffix}`;
  const courseName = `MoodlIA Subsection Course ${suffix}`;
  const courseShortname = `moodlia-subsection-${suffix}`;
  const sectionName = `MoodlIA Subsection Parent ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restSubsectionDeleted = false;
  let mcpSubsectionDeleted = false;
  let cliSubsectionDeleted = false;

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
      summary: `<p>MoodlIA subsection smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restSubsection = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'subsection',
      name: `MoodlIA REST Subsection ${suffix}`,
      options: JSON.stringify({
        visible: true,
        visible_on_course_page: true
      })
    });
    assert.equal(restSubsection.module_type, 'subsection');

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restSubsection.course_module_id
    });
    assertSubsectionDetails(restDetails, restSubsection);

    const restContents = await callRestFunction(toRestFunctionName(contract, 'get_course_contents'), {
      course_id: courseId
    });
    assertCourseContentsInclude(restContents, restSubsection, section.section_number);

    const mcpSubsection = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'subsection',
      name: `MoodlIA MCP Subsection ${suffix}`,
      options: {
        visible: true,
        visible_on_course_page: true
      }
    });
    assert.equal(mcpSubsection.module_type, 'subsection');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpSubsection.course_module_id
    });
    assertSubsectionDetails(mcpDetails, mcpSubsection);

    const cliSubsection = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'subsection',
      '--name', `MoodlIA CLI Subsection ${suffix}`,
      '--options', JSON.stringify({
        visible: true,
        visible_on_course_page: true
      })
    ]);
    assert.equal(cliSubsection.module_type, 'subsection');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliSubsection.course_module_id)
    ]);
    assertSubsectionDetails(cliDetails, cliSubsection);

    const deletedCliSubsection = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliSubsection.course_module_id)
    ]);
    assert.equal(deletedCliSubsection.deleted, true);
    cliSubsectionDeleted = true;

    const deletedMcpSubsection = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpSubsection.course_module_id
    });
    assert.equal(deletedMcpSubsection.deleted, true);
    mcpSubsectionDeleted = true;

    const deletedRestSubsection = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restSubsection.course_module_id
    });
    assert.equal(deletedRestSubsection.deleted, true);
    restSubsectionDeleted = true;

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
      if (!cliSubsectionDeleted) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
      if (!mcpSubsectionDeleted) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
      if (!restSubsectionDeleted) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
      if (!sectionDeleted) {
        // The course is intentionally left behind on failure for manual Moodle inspection.
      }
    } else if (categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
    }
  }
});
