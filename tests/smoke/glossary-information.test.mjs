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

function assertCourseGlossaries(payload, courseId, glossaryModule) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.count, payload.glossaries.length);
  assert.equal(Array.isArray(payload.warnings), true);
  const found = payload.glossaries.find((glossary) => glossary.glossary_id === glossaryModule.instance_id);
  assert.ok(found, `Glossary ${glossaryModule.instance_id} should be listed`);
  assert.equal(found.module_id, glossaryModule.course_module_id);
  assert.equal(typeof found.can_add_entry, 'boolean');
  assert.equal(Array.isArray(found.browse_modes), true);
}

function assertEntryList(payload, glossaryModule, entry) {
  assert.equal(payload.module_id, glossaryModule.course_module_id);
  assert.equal(payload.glossary_id, glossaryModule.instance_id);
  assert.equal(Array.isArray(payload.entries), true);
  assert.equal(Array.isArray(payload.warnings), true);
  assert.ok(payload.entries.some((item) => item.entry_id === entry.entry_id), `Entry ${entry.entry_id} should be listed`);
}

function assertEntry(payload, glossaryModule, entry) {
  assert.equal(payload.module_id, glossaryModule.course_module_id);
  assert.equal(payload.glossary_id, glossaryModule.instance_id);
  assert.equal(payload.entry_id, entry.entry_id);
  assert.equal(payload.concept, entry.concept);
  assert.equal(typeof payload.definition, 'string');
  assert.equal(typeof payload.can_delete, 'boolean');
  assert.equal(typeof payload.can_update, 'boolean');
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertApprovalList(payload, glossaryModule) {
  assert.equal(payload.module_id, glossaryModule.course_module_id);
  assert.equal(payload.glossary_id, glossaryModule.instance_id);
  assert.equal(Number.isInteger(payload.count), true);
  assert.equal(Array.isArray(payload.entries), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertCategories(payload, glossaryModule) {
  assert.equal(payload.module_id, glossaryModule.course_module_id);
  assert.equal(payload.glossary_id, glossaryModule.instance_id);
  assert.equal(Array.isArray(payload.categories), true);
  assert.equal(Array.isArray(payload.warnings), true);
}

function assertAuthors(payload, glossaryModule) {
  assert.equal(payload.module_id, glossaryModule.course_module_id);
  assert.equal(payload.glossary_id, glossaryModule.instance_id);
  assert.equal(Array.isArray(payload.authors), true);
  assert.equal(Array.isArray(payload.warnings), true);
  for (const author of payload.authors) {
    assert.equal(typeof author.user_id, 'number');
    assert.equal(typeof author.full_name, 'string');
    assert.equal(typeof author.picture_url, 'string');
  }
}

test('Glossary information operations work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const callRest = (operation, parameters = {}) =>
    callRestFunction(toRestFunctionName(contract, operation), parameters);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let section = null;
  let glossary = null;
  let entry = null;
  let success = false;

  try {
    category = await callRest('create_course_category', {
      name: `MoodlIA Glossary Info Category ${suffix}`,
      visible: 1
    });
    course = await callRest('create_course', {
      fullname: `MoodlIA Glossary Info Course ${suffix}`,
      shortname: `moodlia-glossary-info-${suffix}`,
      category_id: category.category_id,
      visible: 0
    });
    section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Glossary Info Section ${suffix}`
    });
    glossary = await callRest('create_module', {
      course_id: course.course_id,
      section_number: section.section_number,
      module_type: 'glossary',
      name: `MoodlIA Glossary Info ${suffix}`,
      options: JSON.stringify({
        intro: '<p>MoodlIA glossary information smoke.</p>',
        display_format: 'encyclopedia',
        allow_duplicated_entries: false,
        allow_comments: true
      })
    });
    entry = await callRest('create_glossary_entry', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      concept: `MoodlIA Glossary Info Concept ${suffix}`,
      definition: `<p>MoodlIA glossary information definition ${suffix}</p>`,
      definition_format: 'html',
      options: JSON.stringify({
        aliases: [`moodlia-glossary-alias-${suffix}`],
        usedynalink: true
      })
    });

    const restCourseGlossaries = await callRest('get_course_glossaries', {
      course_id: course.course_id
    });
    assertCourseGlossaries(restCourseGlossaries, course.course_id, glossary);

    const restView = await callRest('view_glossary', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      mode: 'letter'
    });
    assert.equal(restView.viewed, true);

    const restEntryView = await callRest('view_glossary_entry', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      entry_id: entry.entry_id
    });
    assert.equal(restEntryView.viewed, true);

    const restEntry = await callRest('get_glossary_entry', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      entry_id: entry.entry_id
    });
    assertEntry(restEntry, glossary, entry);

    const restByLetter = await callRest('get_glossary_entries_by_letter', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL',
      include_not_approved: 1
    });
    assertEntryList(restByLetter, glossary, entry);

    const restByCategory = await callRest('get_glossary_entries_by_category', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      category_id: -1,
      include_not_approved: 1
    });
    assertEntryList(restByCategory, glossary, entry);

    const restByAuthor = await callRest('get_glossary_entries_by_author', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL',
      field: 'LASTNAME',
      include_not_approved: 1
    });
    assertEntryList(restByAuthor, glossary, entry);

    const restByDate = await callRest('get_glossary_entries_by_date', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      order: 'UPDATE',
      sort: 'DESC',
      include_not_approved: 1
    });
    assertEntryList(restByDate, glossary, entry);

    const restByTerm = await callRest('get_glossary_entries_by_term', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      term: entry.concept,
      include_not_approved: 1
    });
    assertEntryList(restByTerm, glossary, entry);

    const restCategories = await callRest('get_glossary_categories', {
      course_id: course.course_id,
      module_id: glossary.course_module_id
    });
    assertCategories(restCategories, glossary);

    const restAuthors = await callRest('get_glossary_authors', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      include_not_approved: 1
    });
    assertAuthors(restAuthors, glossary);
    assert.ok(restAuthors.authors.length > 0, 'Created glossary entry should expose at least one author.');

    const authorId = restAuthors.authors[0].user_id;
    const restByAuthorId = await callRest('get_glossary_entries_by_author_id', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      author_id: authorId,
      include_not_approved: 1
    });
    assertEntryList(restByAuthorId, glossary, entry);

    const restToApprove = await callRest('get_glossary_entries_to_approve', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL'
    });
    assertApprovalList(restToApprove, glossary);

    const mcpCourseGlossaries = await callMcpTool('get_course_glossaries', {
      course_id: course.course_id
    });
    assertCourseGlossaries(mcpCourseGlossaries, course.course_id, glossary);

    const mcpEntry = await callMcpTool('get_glossary_entry', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      entry_id: entry.entry_id
    });
    assertEntry(mcpEntry, glossary, entry);

    const mcpByLetter = await callMcpTool('get_glossary_entries_by_letter', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL',
      include_not_approved: true
    });
    assertEntryList(mcpByLetter, glossary, entry);

    const mcpByCategory = await callMcpTool('get_glossary_entries_by_category', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      category_id: -1,
      include_not_approved: true
    });
    assertEntryList(mcpByCategory, glossary, entry);

    const mcpByAuthor = await callMcpTool('get_glossary_entries_by_author', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL',
      field: 'LASTNAME',
      include_not_approved: true
    });
    assertEntryList(mcpByAuthor, glossary, entry);

    const mcpByAuthorId = await callMcpTool('get_glossary_entries_by_author_id', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      author_id: authorId,
      include_not_approved: true
    });
    assertEntryList(mcpByAuthorId, glossary, entry);

    const mcpByTerm = await callMcpTool('get_glossary_entries_by_term', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      term: entry.concept,
      include_not_approved: true
    });
    assertEntryList(mcpByTerm, glossary, entry);

    const mcpCategories = await callMcpTool('get_glossary_categories', {
      course_id: course.course_id,
      module_id: glossary.course_module_id
    });
    assertCategories(mcpCategories, glossary);

    const mcpAuthors = await callMcpTool('get_glossary_authors', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      include_not_approved: true
    });
    assertAuthors(mcpAuthors, glossary);

    const mcpToApprove = await callMcpTool('get_glossary_entries_to_approve', {
      course_id: course.course_id,
      module_id: glossary.course_module_id,
      letter: 'ALL'
    });
    assertApprovalList(mcpToApprove, glossary);

    const cliCourseGlossaries = await callCli([
      'get-course-glossaries',
      '--course-id', String(course.course_id)
    ]);
    assertCourseGlossaries(cliCourseGlossaries, course.course_id, glossary);

    const cliView = await callCli([
      'view-glossary',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--mode', 'letter'
    ]);
    assert.equal(cliView.viewed, true);

    const cliEntryView = await callCli([
      'view-glossary-entry',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--entry-id', String(entry.entry_id)
    ]);
    assert.equal(cliEntryView.viewed, true);

    const cliEntry = await callCli([
      'get-glossary-entry',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--entry-id', String(entry.entry_id)
    ]);
    assertEntry(cliEntry, glossary, entry);

    const cliByCategory = await callCli([
      'get-glossary-entries-by-category',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--category-id', '-1',
      '--include-not-approved', 'true'
    ]);
    assertEntryList(cliByCategory, glossary, entry);

    const cliByAuthor = await callCli([
      'get-glossary-entries-by-author',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--letter', 'ALL',
      '--field', 'LASTNAME',
      '--include-not-approved', 'true'
    ]);
    assertEntryList(cliByAuthor, glossary, entry);

    const cliByAuthorId = await callCli([
      'get-glossary-entries-by-author-id',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--author-id', String(authorId),
      '--include-not-approved', 'true'
    ]);
    assertEntryList(cliByAuthorId, glossary, entry);

    const cliByDate = await callCli([
      'get-glossary-entries-by-date',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--order', 'UPDATE',
      '--sort', 'DESC',
      '--include-not-approved', 'true'
    ]);
    assertEntryList(cliByDate, glossary, entry);

    const cliByTerm = await callCli([
      'get-glossary-entries-by-term',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--term', entry.concept,
      '--include-not-approved', 'true'
    ]);
    assertEntryList(cliByTerm, glossary, entry);

    const cliToApprove = await callCli([
      'get-glossary-entries-to-approve',
      '--course-id', String(course.course_id),
      '--module-id', String(glossary.course_module_id),
      '--letter', 'ALL'
    ]);
    assertApprovalList(cliToApprove, glossary);

    success = true;
  } finally {
    if (success && entry?.entry_id && glossary?.course_module_id && course?.course_id) {
      await callRest('delete_glossary_entry', {
        course_id: course.course_id,
        module_id: glossary.course_module_id,
        entry_id: entry.entry_id
      });
    } else if (entry?.entry_id) {
      console.error(`Glossary information entry left in Moodle for inspection: ${entry.entry_id}`);
    }

    if (success && course?.course_id) {
      await callRest('delete_course', {
        course_id: course.course_id
      });
    } else if (course?.course_id) {
      console.error(`Glossary information course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', {
        category_id: category.category_id
      });
    } else if (category?.category_id) {
      console.error(`Glossary information category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
