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

function assertCourseBooks(payload, courseId, bookModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.count, payload.books.length);
  assert.equal(Array.isArray(payload.warnings), true);
  const found = payload.books.find((book) => book.book_id === bookModule.instance_id);
  assert.ok(found, `Book ${bookModule.instance_id} should be listed`);
  assert.equal(found.module_id, bookModule.course_module_id);
  assert.equal(found.course_id, courseId);
  assert.equal(typeof found.name, 'string');
  assert.equal(typeof found.numbering, 'number');
  assert.equal(typeof found.custom_titles, 'boolean');
  assert.equal(typeof found.revision, 'number');
  assert.equal(typeof found.time_modified, 'number');
  assert.equal(typeof found.url, 'string');
}

test('Book information operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let book = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Book Info Category ${suffix}`,
      visible: 1
    });

    course = await callRest('create_course', {
      fullname: `MoodlIA Book Info Course ${suffix}`,
      shortname: `moodlia-book-info-${suffix}`,
      category_id: category.category_id,
      visible: 0
    });

    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Book Info Section ${suffix}`
    });

    book = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'book',
      name: `MoodlIA Book Info ${suffix}`,
      options: JSON.stringify({
        intro: `<p>MoodlIA book information smoke ${suffix}</p>`,
        numbering: 'numbers',
        custom_titles: false
      })
    });

    const restBooks = await callRest('get_course_books', {
      course_id: course.course_id
    });
    assertCourseBooks(restBooks, course.course_id, book);

    const restChapters = await callRest('get_book_chapters', {
      course_id: course.course_id,
      module_id: book.course_module_id,
      include_content: 0
    });
    assert.equal(restChapters.book_id, book.instance_id);
    assert.equal(restChapters.module_id, book.course_module_id);
    assert.equal(restChapters.count, restChapters.chapters.length);

    const restView = await callRest('view_book', {
      course_id: course.course_id,
      module_id: book.course_module_id
    });
    assert.equal(restView.book_id, book.instance_id);
    assert.equal(restView.module_id, book.course_module_id);
    assert.equal(restView.viewed, true);

    const mcpBooks = await callMcpTool('get_course_books', {
      course_id: course.course_id
    });
    assertCourseBooks(mcpBooks, course.course_id, book);

    const mcpView = await callMcpTool('view_book', {
      course_id: course.course_id,
      module_id: book.course_module_id
    });
    assert.equal(mcpView.viewed, true);

    const cliBooks = await callCli([
      'get-course-books',
      '--course-id', String(course.course_id)
    ]);
    assertCourseBooks(cliBooks, course.course_id, book);

    const cliView = await callCli([
      'view-book',
      '--course-id', String(course.course_id),
      '--module-id', String(book.course_module_id)
    ]);
    assert.equal(cliView.viewed, true);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Book information course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Book information category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
