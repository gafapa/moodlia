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

test('Book chapter writes work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Book Chapter Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Book Chapter Course ${suffix}`,
      shortname: `moodlia-book-chapter-${suffix}`,
      category_id: category.category_id,
      visible: 0
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Book Chapter Section ${suffix}`
    });

    const book = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'book',
      name: `MoodlIA Book Chapter ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA book chapter smoke ${suffix}</p>`,
        numbering: 'numbers',
        custom_titles: false
      })
    });

    const restChapter = await callRest('create_book_chapter', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      title: `REST chapter ${suffix}`,
      content: `<p>REST chapter content ${suffix}</p>`
    });
    assert.equal(restChapter.page_number, 1);
    assert.equal(restChapter.subchapter, false);

    const mcpChapter = await callMcpTool('create_book_chapter', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      title: `MCP chapter ${suffix}`,
      content: `<p>MCP chapter content ${suffix}</p>`,
      after_chapter_id: restChapter.chapter_id
    });
    assert.equal(mcpChapter.page_number, 2);

    const cliSubchapter = await callCli([
      'create-book-chapter',
      '--course-id', String(course.course_id),
      '--module-id', String(book.course_module_id),
      '--title', `CLI subchapter ${suffix}`,
      '--content', `<p>CLI subchapter content ${suffix}</p>`,
      '--after-chapter-id', String(restChapter.chapter_id),
      '--subchapter', 'true'
    ]);
    assert.equal(cliSubchapter.subchapter, true);
    assert.equal(cliSubchapter.parent_chapter_id, restChapter.chapter_id);

    const updatedChapter = await callRest('update_book_chapter', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      chapter_id: restChapter.chapter_id,
      title: `REST chapter updated ${suffix}`,
      content: `<p>Updated REST chapter content ${suffix}</p>`
    });
    assert.equal(updatedChapter.title, `REST chapter updated ${suffix}`);
    assert.match(updatedChapter.content, /Updated REST chapter content/);

    const movedChapter = await callMcpTool('move_book_chapter', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      chapter_id: mcpChapter.chapter_id,
      after_chapter_id: 0
    });
    assert.equal(movedChapter.page_number, 1);

    const deletedSubchapter = await callCli([
      'delete-book-chapter',
      '--course-id', String(course.course_id),
      '--module-id', String(book.course_module_id),
      '--chapter-id', String(cliSubchapter.chapter_id)
    ]);
    assert.equal(deletedSubchapter.deleted, true);
    assert.ok(deletedSubchapter.deleted_chapter_ids.includes(cliSubchapter.chapter_id));

    const chapters = await callRest('get_book_chapters', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      include_content: 1
    });
    assert.equal(chapters.count, 2);
    assert.equal(chapters.chapters.some((chapter) => chapter.chapter_id === cliSubchapter.chapter_id), false);
    assert.equal(chapters.chapters[0].chapter_id, mcpChapter.chapter_id);
    assert.equal(chapters.chapters[1].chapter_id, restChapter.chapter_id);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Book chapter course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Book chapter category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
