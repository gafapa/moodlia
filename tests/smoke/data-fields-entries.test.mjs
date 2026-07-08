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

function dataOptions(suffix) {
  return {
    intro: `<p>MoodlIA database fields and entries smoke ${suffix}</p>`,
    approval_required: false,
    manage_approved: false,
    required_entries: 0,
    required_entries_to_view: 0,
    max_entries: 0,
    edit_any: true
  };
}

function assertField(field, expected) {
  assert.equal(field.type, expected.type);
  assert.equal(field.name, expected.name);
  assert.equal(field.required, expected.required);
  assert.equal(field.module_id, expected.moduleId);
  assert.ok(field.field_id > 0);
}

function assertEntry(entry, expected) {
  assert.equal(entry.module_id, expected.moduleId);
  assert.ok(entry.entry_id > 0);
  assert.match(entry.contents_json, expected.text);
}

test('Database fields and entries work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Data Entries Category ${suffix}`;
  const courseName = `MoodlIA Data Entries Course ${suffix}`;
  const courseShortname = `moodlia-data-entries-${suffix}`;
  const sectionName = `MoodlIA Data Entries Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
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
      summary: `<p>MoodlIA data entries smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const database = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `MoodlIA Database Entries ${suffix}`,
      options: JSON.stringify(dataOptions(suffix))
    });

    const restTitleField = await callRestFunction(toRestFunctionName(contract, 'create_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `REST Title ${suffix}`,
      description: 'Title created through REST.',
      required: 1
    });
    assertField(restTitleField, {
      type: 'text',
      name: `REST Title ${suffix}`,
      required: true,
      moduleId: database.course_module_id
    });

    const mcpStatusField = await callMcpTool('create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'menu',
      name: `MCP Status ${suffix}`,
      description: 'Status created through MCP.',
      options: { choices: ['Draft', 'Ready', 'Archived'] }
    });
    assertField(mcpStatusField, {
      type: 'menu',
      name: `MCP Status ${suffix}`,
      required: false,
      moduleId: database.course_module_id
    });

    const cliNotesField = await callCli([
      'create-data-field',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--field-type', 'textarea',
      '--name', `CLI Notes ${suffix}`,
      '--description', 'Notes created through CLI.',
      '--options', JSON.stringify({ rows: 4, columns: 50 })
    ]);
    assertField(cliNotesField, {
      type: 'textarea',
      name: `CLI Notes ${suffix}`,
      required: false,
      moduleId: database.course_module_id
    });

    const restFields = await callRestFunction(toRestFunctionName(contract, 'get_data_fields'), {
      course_id: courseId,
      module_id: database.course_module_id
    });
    assert.equal(restFields.count >= 3, true);

    const mcpFields = await callMcpTool('get_data_fields', {
      course_id: courseId,
      module_id: database.course_module_id
    });
    assert.equal(mcpFields.fields.some((field) => field.field_id === mcpStatusField.field_id), true);

    const cliFields = await callCli([
      'get-data-fields',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id)
    ]);
    assert.equal(cliFields.fields.some((field) => field.field_id === cliNotesField.field_id), true);

    const updatedRestTitleField = await callRestFunction(toRestFunctionName(contract, 'update_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: restTitleField.field_id,
      name: `REST Title Updated ${suffix}`,
      description: 'Title updated through REST.',
      required: 0
    });
    assertField(updatedRestTitleField, {
      type: 'text',
      name: `REST Title Updated ${suffix}`,
      required: false,
      moduleId: database.course_module_id
    });

    const updatedMcpStatusField = await callMcpTool('update_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: mcpStatusField.field_id,
      name: `MCP Status Updated ${suffix}`,
      description: 'Status updated through MCP.',
      required: true,
      options: { choices: ['Draft', 'Ready', 'Archived', 'Published'] }
    });
    assertField(updatedMcpStatusField, {
      type: 'menu',
      name: `MCP Status Updated ${suffix}`,
      required: true,
      moduleId: database.course_module_id
    });

    const updatedCliNotesField = await callCli([
      'update-data-field',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--field-id', String(cliNotesField.field_id),
      '--name', `CLI Notes Updated ${suffix}`,
      '--description', 'Notes updated through CLI.',
      '--required', 'false',
      '--options', JSON.stringify({ rows: 5, columns: 55 })
    ]);
    assertField(updatedCliNotesField, {
      type: 'textarea',
      name: `CLI Notes Updated ${suffix}`,
      required: false,
      moduleId: database.course_module_id
    });

    const restUrlField = await callRestFunction(toRestFunctionName(contract, 'create_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'url',
      name: `REST Link ${suffix}`,
      description: 'Link created through REST.',
      options: JSON.stringify({ auto_link: true, open_in_new_window: true })
    });
    assertField(restUrlField, {
      type: 'url',
      name: `REST Link ${suffix}`,
      required: false,
      moduleId: database.course_module_id
    });

    const restEntryText = `REST entry ${suffix}`;
    const restEntryUrl = `https://example.com/rest-${suffix}`;
    const restEntry = await callRestFunction(toRestFunctionName(contract, 'create_data_entry'), {
      course_id: courseId,
      module_id: database.course_module_id,
      values: JSON.stringify({
        [updatedRestTitleField.name]: restEntryText,
        [updatedMcpStatusField.name]: 'Draft',
        [updatedCliNotesField.name]: `REST notes ${suffix}`,
        [`${restUrlField.name}.url`]: restEntryUrl,
        [`${restUrlField.name}.text`]: 'REST link'
      })
    });
    assertEntry(restEntry, { moduleId: database.course_module_id, text: new RegExp(restEntryText) });
    assertEntry(restEntry, { moduleId: database.course_module_id, text: new RegExp(restEntryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

    const mcpEntryText = `MCP entry ${suffix}`;
    const mcpEntryUrl = `https://example.com/mcp-${suffix}`;
    const mcpEntry = await callMcpTool('create_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      values: {
        [updatedRestTitleField.name]: mcpEntryText,
        [updatedMcpStatusField.name]: 'Ready',
        [updatedCliNotesField.name]: `MCP notes ${suffix}`,
        [`${restUrlField.name}.url`]: mcpEntryUrl,
        [`${restUrlField.name}.text`]: 'MCP link'
      }
    });
    assertEntry(mcpEntry, { moduleId: database.course_module_id, text: new RegExp(mcpEntryText) });
    assertEntry(mcpEntry, { moduleId: database.course_module_id, text: new RegExp(mcpEntryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

    const cliEntryText = `CLI entry ${suffix}`;
    const cliEntryUrl = `https://example.com/cli-${suffix}`;
    const cliEntry = await callCli([
      'create-data-entry',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--values', JSON.stringify({
        [updatedRestTitleField.name]: cliEntryText,
        [updatedMcpStatusField.name]: 'Archived',
        [updatedCliNotesField.name]: `CLI notes ${suffix}`,
        [`${restUrlField.name}.url`]: cliEntryUrl,
        [`${restUrlField.name}.text`]: 'CLI link'
      })
    ]);
    assertEntry(cliEntry, { moduleId: database.course_module_id, text: new RegExp(cliEntryText) });
    assertEntry(cliEntry, { moduleId: database.course_module_id, text: new RegExp(cliEntryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

    const restEntries = await callRestFunction(toRestFunctionName(contract, 'get_data_entries'), {
      course_id: courseId,
      module_id: database.course_module_id,
      include_contents: 1
    });
    assert.equal(restEntries.count >= 3, true);

    const updatedRestText = `REST entry updated ${suffix}`;
    const updatedRestUrl = `https://example.com/rest-updated-${suffix}`;
    const updatedRestEntry = await callRestFunction(toRestFunctionName(contract, 'update_data_entry'), {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: restEntry.entry_id,
      values: JSON.stringify({
        [updatedRestTitleField.name]: updatedRestText,
        [updatedMcpStatusField.name]: 'Ready',
        [updatedCliNotesField.name]: `REST notes updated ${suffix}`,
        [`${restUrlField.name}.url`]: updatedRestUrl,
        [`${restUrlField.name}.text`]: 'REST updated link'
      })
    });
    assertEntry(updatedRestEntry, { moduleId: database.course_module_id, text: new RegExp(updatedRestText) });
    assertEntry(updatedRestEntry, { moduleId: database.course_module_id, text: new RegExp(updatedRestUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });

    const updatedMcpText = `MCP entry updated ${suffix}`;
    const updatedMcpEntry = await callMcpTool('update_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: mcpEntry.entry_id,
      values: {
        [updatedRestTitleField.name]: updatedMcpText,
        [updatedMcpStatusField.name]: 'Published',
        [updatedCliNotesField.name]: `MCP notes updated ${suffix}`
      }
    });
    assertEntry(updatedMcpEntry, { moduleId: database.course_module_id, text: new RegExp(updatedMcpText) });

    const updatedCliText = `CLI entry updated ${suffix}`;
    const updatedCliEntry = await callCli([
      'update-data-entry',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--entry-id', String(cliEntry.entry_id),
      '--values', JSON.stringify({
        [updatedRestTitleField.name]: updatedCliText,
        [updatedMcpStatusField.name]: 'Archived',
        [updatedCliNotesField.name]: `CLI notes updated ${suffix}`
      })
    ]);
    assertEntry(updatedCliEntry, { moduleId: database.course_module_id, text: new RegExp(updatedCliText) });

    const details = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: database.course_module_id
    });
    const extra = JSON.parse(details.extra_json);
    assert.equal(extra.activity.field_count >= 4, true);
    assert.equal(extra.activity.entry_count >= 3, true);

    const deletedRest = await callRestFunction(toRestFunctionName(contract, 'delete_data_entry'), {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: restEntry.entry_id
    });
    assert.equal(deletedRest.deleted, true);

    const deletedMcp = await callMcpTool('delete_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      entry_id: mcpEntry.entry_id
    });
    assert.equal(deletedMcp.deleted, true);

    const deletedCli = await callCli([
      'delete-data-entry',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--entry-id', String(cliEntry.entry_id)
    ]);
    assert.equal(deletedCli.deleted, true);

    const deletedRestField = await callRestFunction(toRestFunctionName(contract, 'delete_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: updatedRestTitleField.field_id
    });
    assert.equal(deletedRestField.deleted, true);

    const deletedMcpField = await callMcpTool('delete_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: updatedMcpStatusField.field_id
    });
    assert.equal(deletedMcpField.deleted, true);

    const deletedCliField = await callCli([
      'delete-data-field',
      '--course-id', String(courseId),
      '--module-id', String(database.course_module_id),
      '--field-id', String(updatedCliNotesField.field_id)
    ]);
    assert.equal(deletedCliField.deleted, true);

    const deletedRestUrlField = await callRestFunction(toRestFunctionName(contract, 'delete_data_field'), {
      course_id: courseId,
      module_id: database.course_module_id,
      field_id: restUrlField.field_id
    });
    assert.equal(deletedRestUrlField.deleted, true);

    const fieldsAfterDelete = await callRestFunction(toRestFunctionName(contract, 'get_data_fields'), {
      course_id: courseId,
      module_id: database.course_module_id
    });
    assert.equal(fieldsAfterDelete.fields.some((field) => field.field_id === updatedRestTitleField.field_id), false);
    assert.equal(fieldsAfterDelete.fields.some((field) => field.field_id === updatedMcpStatusField.field_id), false);
    assert.equal(fieldsAfterDelete.fields.some((field) => field.field_id === updatedCliNotesField.field_id), false);
    assert.equal(fieldsAfterDelete.fields.some((field) => field.field_id === restUrlField.field_id), false);

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
      console.error(`Generated data fields and entries course left in Moodle for inspection: ${courseId}`);
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated data fields and entries category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
