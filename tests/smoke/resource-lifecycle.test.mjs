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

test('Resource file lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Resource Smoke Category ${suffix}`;
  const courseName = `MoodlIA Resource Smoke Course ${suffix}`;
  const courseShortname = `moodlia-resource-smoke-${suffix}`;
  const sectionName = `MoodlIA Resource Smoke Section ${suffix}`;
  const resourceName = `MoodlIA Resource Smoke File ${suffix}`;
  const resourceFilename = `moodlia-resource-smoke-${suffix}.txt`;
  const resourceContent = `MoodlIA resource file smoke content ${suffix}`;
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
      summary: 'Resource smoke section.'
    });
    const resourceModule = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'resource',
      name: resourceName,
      options: JSON.stringify({
        intro: `<p>Resource smoke activity ${suffix}.</p>`,
        filename: resourceFilename,
        upload_reference: Buffer.from(resourceContent, 'utf8').toString('base64'),
        display: 'embed',
        print_intro: false,
        show_size: true,
        show_type: true,
        show_date: true,
        popup_width: 900,
        popup_height: 600,
        filter_files: 'none'
      })
    });

    assert.equal(resourceModule.module_type, 'resource');
    assert.equal(resourceModule.name, resourceName);
    assert.match(resourceModule.url, /\/mod\/resource\/view\.php\?id=/);

    const restFiles = await callRest('get_resource_files', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id
    });
    const restFile = restFiles.files.find((file) => file.filename === resourceFilename);
    assert.ok(restFile, 'resource file must be listed through REST.');
    assert.equal(restFile.filesize, Buffer.byteLength(resourceContent, 'utf8'));
    assert.match(restFile.url, /pluginfile\.php/);

    const restDetails = await callRest('get_module_details', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id
    });
    const restExtra = JSON.parse(restDetails.extra_json);
    assert.equal(restDetails.module_type, 'resource');
    assert.equal(restExtra.activity.resource_id, resourceModule.instance_id);
    assert.equal(restExtra.activity.file_count, restFiles.files.length);
    assert.ok(restExtra.activity.total_size >= Buffer.byteLength(resourceContent, 'utf8'));
    assert.equal(restExtra.activity.primary_file.filename, resourceFilename);

    const restDownload = await callRest('download_resource_file', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id,
      file_id: restFile.file_id
    });
    assert.equal(restDownload.file_id, restFile.file_id);
    assert.equal(restDownload.filename, resourceFilename);

    const mcpFiles = await callMcpTool('get_resource_files', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id
    });
    assert.ok(mcpFiles.files.some((file) => file.file_id === restFile.file_id && file.filename === resourceFilename));

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id
    });
    const mcpExtra = JSON.parse(mcpDetails.extra_json);
    assert.equal(mcpExtra.activity.resource_id, resourceModule.instance_id);
    assert.equal(mcpExtra.activity.file_count, mcpFiles.files.length);

    const mcpDownload = await callMcpTool('download_resource_file', {
      course_id: course.course_id,
      module_id: resourceModule.course_module_id,
      file_id: restFile.file_id
    });
    assert.equal(mcpDownload.filename, resourceFilename);

    const cliFiles = await callCli([
      'get-resource-files',
      '--course-id', String(course.course_id),
      '--module-id', String(resourceModule.course_module_id)
    ]);
    assert.ok(cliFiles.files.some((file) => file.file_id === restFile.file_id && file.filename === resourceFilename));

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(course.course_id),
      '--module-id', String(resourceModule.course_module_id)
    ]);
    const cliExtra = JSON.parse(cliDetails.extra_json);
    assert.equal(cliExtra.activity.resource_id, resourceModule.instance_id);
    assert.equal(cliExtra.activity.file_count, cliFiles.files.length);

    const cliDownload = await callCli([
      'download-resource-file',
      '--course-id', String(course.course_id),
      '--module-id', String(resourceModule.course_module_id),
      '--file-id', String(restFile.file_id)
    ]);
    assert.equal(cliDownload.file_id, restFile.file_id);
    assert.equal(cliDownload.filename, resourceFilename);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Resource smoke course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Resource smoke category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
