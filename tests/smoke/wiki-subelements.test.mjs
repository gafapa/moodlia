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

function assertSubwikis(payload, courseId, wiki) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, wiki.course_module_id);
  assert.equal(payload.wiki_id, wiki.instance_id);
  assert.equal(Number.isInteger(payload.count), true);
  assert.equal(Array.isArray(payload.subwikis), true);
  assert.equal(Array.isArray(payload.warnings), true);
  assert.ok(payload.count >= 1, 'A wiki with a created page should expose at least one visible subwiki.');
  assert.ok(payload.subwikis.some((subwiki) => subwiki.wiki_id === wiki.instance_id));
}

function assertFiles(payload, courseId, wiki) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, wiki.course_module_id);
  assert.equal(payload.wiki_id, wiki.instance_id);
  assert.equal(Number.isInteger(payload.count), true);
  assert.equal(Array.isArray(payload.files), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertView(payload, courseId, wiki) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, wiki.course_module_id);
  assert.equal(payload.wiki_id, wiki.instance_id);
  assert.equal(payload.status, true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertPageView(payload, courseId, wiki, page) {
  assertView(payload, courseId, wiki);
  assert.equal(payload.page_id, page.page_id);
}

test('Wiki subelement operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Wiki Subelements Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Wiki Subelements Course ${suffix}`,
      shortname: `moodlia-wiki-subelements-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA wiki subelements smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Wiki Subelements Section ${suffix}`
    });

    const wiki = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'wiki',
      name: `MoodlIA Wiki Subelements ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Wiki subelement smoke.</p>',
        first_page_title: `MoodlIA Wiki Subelements First Page ${suffix}`,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    });

    const page = await callRest('create_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      title: `MoodlIA Wiki Subelements Page ${suffix}`,
      content: `<p>Wiki subelement page ${suffix}</p>`,
      content_format: 'html'
    });

    const restSubwikis = await callRest('get_wiki_subwikis', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertSubwikis(restSubwikis, course.course_id, wiki);

    const mcpSubwikis = await callMcpTool('get_wiki_subwikis', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertSubwikis(mcpSubwikis, course.course_id, wiki);

    const cliSubwikis = await callCli([
      'get-wiki-subwikis',
      '--course-id', String(course.course_id),
      '--module-id', String(wiki.course_module_id)
    ]);
    assertSubwikis(cliSubwikis, course.course_id, wiki);

    const restFiles = await callRest('get_wiki_files', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertFiles(restFiles, course.course_id, wiki);

    const mcpFiles = await callMcpTool('get_wiki_files', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertFiles(mcpFiles, course.course_id, wiki);

    const cliFiles = await callCli([
      'get-wiki-files',
      '--course-id', String(course.course_id),
      '--module-id', String(wiki.course_module_id)
    ]);
    assertFiles(cliFiles, course.course_id, wiki);

    const restView = await callRest('view_wiki', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertView(restView, course.course_id, wiki);

    const mcpView = await callMcpTool('view_wiki', {
      course_id: course.course_id,
      module_id: wiki.course_module_id
    });
    assertView(mcpView, course.course_id, wiki);

    const cliView = await callCli([
      'view-wiki',
      '--course-id', String(course.course_id),
      '--module-id', String(wiki.course_module_id)
    ]);
    assertView(cliView, course.course_id, wiki);

    const restPageView = await callRest('view_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      page_id: page.page_id
    });
    assertPageView(restPageView, course.course_id, wiki, page);

    const mcpPageView = await callMcpTool('view_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      page_id: page.page_id
    });
    assertPageView(mcpPageView, course.course_id, wiki, page);

    const cliPageView = await callCli([
      'view-wiki-page',
      '--course-id', String(course.course_id),
      '--module-id', String(wiki.course_module_id),
      '--page-id', String(page.page_id)
    ]);
    assertPageView(cliPageView, course.course_id, wiki, page);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Wiki subelements course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Wiki subelements category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
