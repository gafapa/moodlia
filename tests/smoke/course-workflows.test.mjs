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
const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

function parseJsonField(payload, field) {
  assert.equal(typeof payload[field], 'string', `${field} must be a JSON string.`);
  return JSON.parse(payload[field]);
}

async function assertInvalidRestCall(promise, label) {
  try {
    await promise;
  } catch (error) {
    assert.equal(error.code, 'invalid_parameters', `${label} must fail with invalid_parameters.`);
    assert.notEqual(
      error.details?.moodle_errorcode,
      'invalidrecordunknown',
      `${label} must fail because of payload validation, not because Moodle cannot resolve a service record.`
    );
    return;
  }

  assert.fail(`${label} was expected to fail.`);
}

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

test('course blueprint workflows create, publish, audit, apply, export, and copy structure', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const created = {
    categoryId: null,
    sourceCourseId: null,
    targetCourseId: null
  };

  try {
    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Course Workflow Category ${suffix}`,
      visible: 1
    });
    created.categoryId = category.category_id;

    const blueprint = {
      version: 1,
      course: {
        fullname: `MoodlIA Blueprint Source ${suffix}`,
        shortname: `moodlia-blueprint-source-${suffix}`,
        category_id: created.categoryId,
        summary: `<p>Course workflow smoke ${suffix}</p>`,
        summary_format: 'html',
        course_format: 'topics',
        enable_completion: true
      },
      publish_state: 'draft',
      sections: [
        {
          name: `Blueprint Section ${suffix}`,
          summary: 'Created from a portable course blueprint.',
          modules: [
            {
              module_type: 'page',
              name: `Blueprint Page ${suffix}`,
              options: {
                content: `<p>Blueprint page content ${suffix}</p>`
              }
            }
          ]
        }
      ],
      groups: [
        {
          name: `Blueprint Group ${suffix}`,
          description: 'Created from a portable course blueprint.'
        }
      ]
    };

    const createdFromBlueprint = await callRestFunction(restName('create_course_from_blueprint'), {
      blueprint: JSON.stringify(blueprint)
    });
    created.sourceCourseId = createdFromBlueprint.course_id;
    assert.equal(createdFromBlueprint.publish_state, 'draft');
    assert.equal(JSON.parse(createdFromBlueprint.course_json).visible, false);
    assert.equal(parseJsonField(createdFromBlueprint, 'sections_json').length, 1);
    assert.equal(parseJsonField(createdFromBlueprint, 'modules_json').length, 1);
    assert.equal(parseJsonField(createdFromBlueprint, 'groups_json').length, 1);

    const draftAudit = await callRestFunction(restName('audit_course'), {
      course_id: created.sourceCourseId
    });
    assert.equal(draftAudit.course_id, created.sourceCourseId);
    assert.equal(Number.isInteger(draftAudit.issue_count), true);
    const draftIssues = parseJsonField(draftAudit, 'issues_json');
    assert.ok(draftIssues.some((issue) => issue.code === 'course_hidden'));

    const exported = await callRestFunction(restName('export_course_blueprint'), {
      course_id: created.sourceCourseId,
      include_contents: 1,
      include_groups: 1
    });
    const exportedBlueprint = parseJsonField(exported, 'blueprint_json');
    assert.equal(exportedBlueprint.course.fullname, blueprint.course.fullname);
    assert.ok(exportedBlueprint.sections.length >= 1);
    assert.ok(exportedBlueprint.groups.length >= 1);

    const published = await callRestFunction(restName('set_course_publish_state'), {
      course_id: created.sourceCourseId,
      publish_state: 'published'
    });
    assert.equal(published.publish_state, 'published');
    assert.equal(published.visible, true);

    const applied = await callRestFunction(restName('apply_course_blueprint'), {
      course_id: created.sourceCourseId,
      blueprint: JSON.stringify({
        sections: [
          {
            name: `Incremental Section ${suffix}`,
            summary: 'Applied after initial course creation.',
            modules: [
              {
                module_type: 'label',
                name: `Incremental Label ${suffix}`,
                options: {
                  intro: `<p>Incremental label ${suffix}</p>`
                }
              }
            ]
          }
        ]
      })
    });
    assert.equal(applied.course_id, created.sourceCourseId);
    assert.equal(parseJsonField(applied, 'sections_json').length, 1);
    assert.equal(parseJsonField(applied, 'modules_json').length, 1);

    const targetCourse = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Blueprint Target ${suffix}`,
      shortname: `moodlia-blueprint-target-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      summary: `<p>Course workflow target ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    created.targetCourseId = targetCourse.course_id;

    const copied = await callRestFunction(restName('copy_course_structure'), {
      source_course_id: created.sourceCourseId,
      target_course_id: created.targetCourseId,
      include_contents: 1,
      include_groups: 1
    });
    assert.equal(copied.source_course_id, created.sourceCourseId);
    assert.equal(copied.target_course_id, created.targetCourseId);
    assert.ok(parseJsonField(copied, 'sections_json').length >= 1);
    assert.ok(parseJsonField(copied, 'modules_json').length >= 1);

  } finally {
    const cleanupCalls = [
      created.targetCourseId === null ? null : ['delete_course', { course_id: created.targetCourseId }],
      created.sourceCourseId === null ? null : ['delete_course', { course_id: created.sourceCourseId }],
      created.categoryId === null ? null : ['delete_course_category', { category_id: created.categoryId }]
    ].filter(Boolean);

    for (const [operationName, parameters] of cleanupCalls) {
      try {
        await callRestFunction(restName(operationName), parameters);
      } catch {
        throw new Error(`Cleanup failed for ${operationName}.`);
      }
    }
  }
});

test('course workflow operations reject malformed and no-op payloads', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const created = {
    categoryId: null,
    sourceCourseId: null,
    targetCourseId: null
  };

  try {
    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Course Workflow Edge Category ${suffix}`,
      visible: 1
    });
    created.categoryId = category.category_id;

    const sourceCourse = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Workflow Edge Source ${suffix}`,
      shortname: `moodlia-workflow-edge-source-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      summary: `<p>Workflow edge source ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    created.sourceCourseId = sourceCourse.course_id;

    const targetCourse = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Workflow Edge Target ${suffix}`,
      shortname: `moodlia-workflow-edge-target-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      summary: `<p>Workflow edge target ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    created.targetCourseId = targetCourse.course_id;

    await assertInvalidRestCall(callRestFunction(restName('create_course_from_blueprint'), {
      blueprint: JSON.stringify({
        course: {
          fullname: `MoodlIA Invalid Blueprint ${suffix}`,
          shortname: `moodlia-invalid-blueprint-${suffix}`,
          category_id: created.categoryId
        },
        sections: {
          name: 'This must be an array'
        }
      })
    }), 'create_course_from_blueprint with object sections');

    await assertInvalidRestCall(callRestFunction(restName('apply_course_blueprint'), {
      course_id: created.sourceCourseId,
      blueprint: JSON.stringify({})
    }), 'apply_course_blueprint with an empty no-op blueprint');

    await assertInvalidRestCall(callRestFunction(restName('apply_course_blueprint'), {
      course_id: created.sourceCourseId,
      blueprint: JSON.stringify({
        sections: [
          {
            name: 'Invalid module container',
            modules: {
              module_type: 'page'
            }
          }
        ]
      })
    }), 'apply_course_blueprint with object modules');

    await assertInvalidRestCall(callRestFunction(restName('apply_course_blueprint'), {
      course_id: created.sourceCourseId,
      blueprint: JSON.stringify({
        sections: [
          {
            name: 'Unsupported module',
            modules: [
              {
                module_type: 'unsupported',
                name: 'Unsupported'
              }
            ]
          }
        ]
      })
    }), 'apply_course_blueprint with unsupported module_type');

    await assertInvalidRestCall(callRestFunction(restName('sync_course_enrolments'), {
      course_id: created.sourceCourseId,
      enrolments: JSON.stringify([
        {
          user_id: '7abc',
          role_archetype: 'student'
        }
      ])
    }), 'sync_course_enrolments with non-integer user_id');

    await assertInvalidRestCall(callRestFunction(restName('sync_course_enrolments'), {
      course_id: created.sourceCourseId,
      enrolments: JSON.stringify([
        {
          user_id: 7,
          role_archetype: 'manager'
        }
      ])
    }), 'sync_course_enrolments with unsupported role_archetype');

    await assertInvalidRestCall(callRestFunction(restName('set_course_publish_state'), {
      course_id: created.sourceCourseId,
      publish_state: 'review'
    }), 'set_course_publish_state with unsupported publish_state');

    await assertInvalidRestCall(callRestFunction(restName('copy_course_structure'), {
      source_course_id: created.sourceCourseId,
      target_course_id: created.targetCourseId,
      include_contents: 0,
      include_groups: 0
    }), 'copy_course_structure with no selected copy targets');
  } finally {
    const cleanupCalls = [
      created.targetCourseId === null ? null : ['delete_course', { course_id: created.targetCourseId }],
      created.sourceCourseId === null ? null : ['delete_course', { course_id: created.sourceCourseId }],
      created.categoryId === null ? null : ['delete_course_category', { category_id: created.categoryId }]
    ].filter(Boolean);

    for (const [operationName, parameters] of cleanupCalls) {
      try {
        await callRestFunction(restName(operationName), parameters);
      } catch {
        throw new Error(`Cleanup failed for ${operationName}.`);
      }
    }
  }
});

test('course workflow transports work through REST setup, MCP execution, and CLI publishing', { skip: !hasRestConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const restName = (operationName) => toRestFunctionName(contract, operationName);
  const created = {
    categoryId: null,
    courseId: null
  };

  try {
    const category = await callRestFunction(restName('create_course_category'), {
      name: `MoodlIA Course Workflow Transport Category ${suffix}`,
      visible: 1
    });
    created.categoryId = category.category_id;

    const course = await callRestFunction(restName('create_course'), {
      fullname: `MoodlIA Workflow Transport Course ${suffix}`,
      shortname: `moodlia-workflow-transport-${suffix}`,
      category_id: created.categoryId,
      visible: 0,
      summary: `<p>Workflow transport smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics',
      enable_completion: 1
    });
    created.courseId = course.course_id;

    const mcpApplied = await callMcpTool('apply_course_blueprint', {
      course_id: created.courseId,
      blueprint: {
        sections: [
          {
            name: `MCP Applied Section ${suffix}`,
            modules: [
              {
                module_type: 'label',
                name: `MCP Applied Label ${suffix}`,
                options: {
                  intro: `<p>MCP applied label ${suffix}</p>`
                }
              }
            ]
          }
        ],
        groups: [
          {
            name: `MCP Applied Group ${suffix}`
          }
        ]
      }
    });
    assert.equal(mcpApplied.course_id, created.courseId);
    assert.equal(parseJsonField(mcpApplied, 'sections_json').length, 1);
    assert.equal(parseJsonField(mcpApplied, 'modules_json').length, 1);
    assert.equal(parseJsonField(mcpApplied, 'groups_json').length, 1);

    const cliPublished = await callCli([
      'set-course-publish-state',
      '--course-id', String(created.courseId),
      '--publish-state', 'published'
    ]);
    assert.equal(cliPublished.publish_state, 'published');
    assert.equal(cliPublished.visible, true);

    const cliAudit = await callCli([
      'audit-course',
      '--course-id', String(created.courseId)
    ]);
    assert.equal(cliAudit.course_id, created.courseId);
    assert.equal(Number.isInteger(cliAudit.issue_count), true);

    const mcpExported = await callMcpTool('export_course_blueprint', {
      course_id: created.courseId,
      include_contents: true,
      include_groups: true
    });
    const exportedBlueprint = parseJsonField(mcpExported, 'blueprint_json');
    assert.ok(exportedBlueprint.sections.some((section) => section.name === `MCP Applied Section ${suffix}`));
    assert.ok(exportedBlueprint.groups.some((group) => group.name === `MCP Applied Group ${suffix}`));
  } finally {
    const cleanupCalls = [
      created.courseId === null ? null : ['delete_course', { course_id: created.courseId }],
      created.categoryId === null ? null : ['delete_course_category', { category_id: created.categoryId }]
    ].filter(Boolean);

    for (const [operationName, parameters] of cleanupCalls) {
      try {
        await callRestFunction(restName(operationName), parameters);
      } catch {
        throw new Error(`Cleanup failed for ${operationName}.`);
      }
    }
  }
});
