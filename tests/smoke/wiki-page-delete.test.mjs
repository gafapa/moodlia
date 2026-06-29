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

function assertDeletedPage(payload, courseId, wiki, page) {
  assert.equal(payload.deleted, true);
  assert.equal(payload.id, page.page_id);
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.module_id, wiki.course_module_id);
  assert.equal(payload.wiki_id, wiki.instance_id);
  assert.equal(payload.subwiki_id, page.subwiki_id);
  assert.equal(payload.title, page.title);
}

function assertPageAbsent(pages, page) {
  assert.equal(
    pages.some((candidate) => candidate.page_id === page.page_id),
    false,
    `Wiki page ${page.page_id} should be absent after deletion`
  );
}

test('Wiki pages can be deleted through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Wiki Delete Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Wiki Delete Course ${suffix}`,
      shortname: `moodlia-wiki-delete-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      summary: `<p>MoodlIA wiki delete smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Wiki Delete Section ${suffix}`
    });

    const wiki = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'wiki',
      name: `MoodlIA Wiki Delete ${suffix}`,
      options: JSON.stringify({
        intro: '<p>Wiki page deletion smoke.</p>',
        first_page_title: `MoodlIA Wiki Delete First Page ${suffix}`,
        wiki_mode: 'collaborative',
        default_format: 'html'
      })
    });

    const restPage = await callRest('create_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      title: `MoodlIA REST Wiki Delete ${suffix}`,
      content: `<p>REST page to delete ${suffix}</p>`,
      content_format: 'html'
    });
    const mcpPage = await callRest('create_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      title: `MoodlIA MCP Wiki Delete ${suffix}`,
      content: `<p>MCP page to delete ${suffix}</p>`,
      content_format: 'html'
    });
    const cliPage = await callRest('create_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      title: `MoodlIA CLI Wiki Delete ${suffix}`,
      content: `<p>CLI page to delete ${suffix}</p>`,
      content_format: 'html'
    });

    const restDeleted = await callRest('delete_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      page_id: restPage.page_id
    });
    assertDeletedPage(restDeleted, course.course_id, wiki, restPage);

    const mcpDeleted = await callMcpTool('delete_wiki_page', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      page_id: mcpPage.page_id
    });
    assertDeletedPage(mcpDeleted, course.course_id, wiki, mcpPage);

    const cliDeleted = await callCli([
      'delete-wiki-page',
      '--course-id', String(course.course_id),
      '--module-id', String(wiki.course_module_id),
      '--page-id', String(cliPage.page_id)
    ]);
    assertDeletedPage(cliDeleted, course.course_id, wiki, cliPage);

    const listed = await callRest('get_wiki_pages', {
      course_id: course.course_id,
      module_id: wiki.course_module_id,
      include_content: 0
    });
    assertPageAbsent(listed.pages, restPage);
    assertPageAbsent(listed.pages, mcpPage);
    assertPageAbsent(listed.pages, cliPage);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Wiki page delete course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Wiki page delete category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
