import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { buildContractParameters } from '../../client/moodle-rest-client.mjs';
import { loadContract, readJson, toKebabCase } from '../helpers/contract.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const courseWorkflowOperations = [
  'export_course_blueprint',
  'create_course_from_blueprint',
  'apply_course_blueprint',
  'copy_course_structure',
  'sync_course_enrolments',
  'set_course_publish_state',
  'audit_course',
  'backup_course',
  'restore_course_backup',
  'upload_course_backup',
  'get_course_backup_files',
  'delete_course_backup_file',
  'audit_course_completion',
  'repair_course_completion'
];

function extractPhpStringConstantArray(source, constantName) {
  const match = source.match(new RegExp(`public const ${constantName} = \\[([\\s\\S]*?)\\];`));
  assert.ok(match, `course_workflow_tools.php must declare ${constantName}.`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

test('course workflow operations stay aligned across contract, manifests, and docs', async () => {
  const contract = await loadContract();
  const mcpManifest = await readJson('automation/manifests/mcp-tools.json');
  const cliManifest = await readJson('automation/manifests/cli-commands.json');
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const mcpPhpManifest = await fs.readFile(fromRoot('plugin/moodlia/classes/mcp/manifest.php'), 'utf8');
  const cliDocs = await fs.readFile(fromRoot('docs/cli-usage.md'), 'utf8');
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));

  for (const operationName of courseWorkflowOperations) {
    const operation = byName.get(operationName);
    assert.ok(operation, `${operationName} must exist in the operation contract.`);
    assert.deepEqual(operation.transports, ['rest', 'mcp', 'cli'], `${operationName} must expose REST, MCP, and CLI.`);
    assert.ok(operation.tests.includes('parity'), `${operationName} must declare parity test coverage.`);
    assert.match(services, new RegExp(`local_moodlia_${operationName}\\b`), `${operationName} must be registered as REST.`);
    assert.ok(mcpManifest.tools.includes(operationName), `${operationName} must be in the generated MCP manifest.`);
    assert.match(mcpPhpManifest, new RegExp(`'name'\\s*=>\\s*'${operationName}'`), `${operationName} must be in the PHP MCP manifest.`);
    assert.ok(cliManifest.commands.includes(toKebabCase(operationName)), `${operationName} must be in the CLI manifest.`);
    assert.match(cliDocs, new RegExp(`moodlia ${toKebabCase(operationName)}`), `${operationName} must be documented in CLI usage.`);
  }
});

test('course workflow validation constants match the published contract enums', async () => {
  const contract = await loadContract();
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const courseWorkflowTools = await fs.readFile(
    fromRoot('plugin/moodlia/classes/operation/course_workflow_tools.php'),
    'utf8'
  );

  const moduleTypes = extractPhpStringConstantArray(courseWorkflowTools, 'MODULE_TYPES');
  const publishStates = extractPhpStringConstantArray(courseWorkflowTools, 'PUBLISH_STATES');
  const roleArchetypes = extractPhpStringConstantArray(courseWorkflowTools, 'ROLE_ARCHETYPES');

  assert.deepEqual(moduleTypes, byName.get('create_module').parameters.module_type.enum);
  assert.deepEqual(publishStates, byName.get('set_course_publish_state').parameters.publish_state.enum);
  assert.deepEqual(roleArchetypes, byName.get('enrol_user').parameters.role_archetype.enum);
});

test('course workflow writes validate nested payloads before applying side effects', async () => {
  const courseWorkflowTools = await fs.readFile(
    fromRoot('plugin/moodlia/classes/operation/course_workflow_tools.php'),
    'utf8'
  );
  const syncEnrolments = await fs.readFile(
    fromRoot('plugin/moodlia/classes/operation/sync_course_enrolments.php'),
    'utf8'
  );
  const createSection = await fs.readFile(
    fromRoot('plugin/moodlia/classes/operation/create_section.php'),
    'utf8'
  );

  assert.match(courseWorkflowTools, /self::validate_blueprint\(\$blueprint,\s*true,\s*true\)/);
  assert.match(courseWorkflowTools, /self::blueprint_has_workflow\(\$blueprint\)/);
  assert.match(courseWorkflowTools, /self::validate_blueprint\(\$blueprint,\s*false,\s*false\)/);
  assert.match(courseWorkflowTools, /blueprint\.sections\[/);
  assert.match(courseWorkflowTools, /blueprint\.groups\[/);
  assert.match(courseWorkflowTools, /blueprint\.enrolments/);
  assert.match(courseWorkflowTools, /module_type is unsupported/);
  assert.match(courseWorkflowTools, /options must be a JSON object/);
  assert.match(courseWorkflowTools, /chapters is only supported for module_type=book/);
  assert.match(courseWorkflowTools, /validate_book_chapters/);
  assert.match(courseWorkflowTools, /subchapter must be false/);
  assert.match(courseWorkflowTools, /hidden must be a boolean/);
  assert.match(courseWorkflowTools, /content must be a string/);
  assert.match(courseWorkflowTools, /text_like_value/);
  assert.match(courseWorkflowTools, /get_book_chapters::execute/);
  assert.match(courseWorkflowTools, /create_book_chapter::execute/);
  assert.match(courseWorkflowTools, /require_capability\('mod\/book:edit'/);
  assert.match(courseWorkflowTools, /blueprint must include at least one section, group, or enrolment/);
  assert.match(courseWorkflowTools, /role_archetype must be one of: student, teacher, editingteacher/);
  assert.match(courseWorkflowTools, /preg_match\('\/\^\[1-9\]\[0-9\]\*\$\/'/);
  assert.match(courseWorkflowTools, /preg_match\('\/\^\[0-9\]\+\$\/'/);
  assert.match(syncEnrolments, /course_workflow_tools::validate_enrolments\(\$enrolments\)/);
  assert.match(createSection, /\$targetposition = \$position === 0 \? count\(get_fast_modinfo\(\$course\)->get_section_info_all\(\)\) : \$position/);
  assert.doesNotMatch(createSection, /\$targetposition = \$position === 0 \? null : \$position/);
  assert.doesNotMatch(createSection, /\$targetposition = \$position === 0 \? false : \$position/);
});

test('course workflow external permissions match requested blueprint work', async () => {
  const services = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const applyBlueprint = await fs.readFile(
    fromRoot('plugin/moodlia/classes/external/apply_course_blueprint.php'),
    'utf8'
  );
  const createFromBlueprint = await fs.readFile(
    fromRoot('plugin/moodlia/classes/external/create_course_from_blueprint.php'),
    'utf8'
  );
  const copyStructure = await fs.readFile(
    fromRoot('plugin/moodlia/classes/external/copy_course_structure.php'),
    'utf8'
  );

  for (const source of [applyBlueprint, createFromBlueprint]) {
    assert.ok(
      source.includes("!empty($decoded['sections'])") || source.includes("!empty($blueprint['sections'])")
    );
    assert.match(source, /require_capability\('moodle\/course:manageactivities'/);
    assert.ok(
      source.includes("!empty($decoded['groups'])") || source.includes("!empty($blueprint['groups'])")
    );
    assert.match(source, /require_capability\('moodle\/course:managegroups'/);
    assert.ok(
      source.includes("!empty($decoded['enrolments'])") || source.includes("!empty($blueprint['enrolments'])")
    );
    assert.match(source, /require_capability\('enrol\/manual:enrol'/);
  }

  assert.match(copyStructure, /if \(\$includecontents\)/);
  assert.match(copyStructure, /if \(\$includegroups\)/);
  assert.match(
    services,
    /'local_moodlia_apply_course_blueprint'[\s\S]*?'capabilities'\s*=>\s*'local\/moodlia:useapi'/,
    'apply_course_blueprint service registration must stay context-neutral.'
  );
  assert.match(
    services,
    /'local_moodlia_copy_course_structure'[\s\S]*?'capabilities'\s*=>\s*'local\/moodlia:useapi'/,
    'copy_course_structure service registration must stay context-neutral.'
  );
  assert.match(
    services,
    /'local_moodlia_create_course_from_blueprint'[\s\S]*?'capabilities'\s*=>\s*'local\/moodlia:useapi,moodle\/course:create'/,
    'create_course_from_blueprint service registration must only require course creation up front.'
  );
});

test('course workflow contract validates edge-case CLI and client parameters', async () => {
  const contract = await loadContract();
  const byName = new Map(contract.operations.map((operation) => [operation.name, operation]));
  const blueprint = {
    course: {
      fullname: 'Generated workflow course',
      shortname: 'generated-workflow-course'
    },
    sections: [
      {
        name: 'Unit 1',
        modules: [
          {
            module_type: 'page',
            name: 'Welcome',
            options: {
              content: '<p>Hello</p>'
            }
          }
        ]
      }
    ]
  };

  assert.deepEqual(buildContractParameters(byName.get('create_course_from_blueprint'), { blueprint }), {
    blueprint: JSON.stringify(blueprint)
  });

  assert.deepEqual(buildContractParameters(byName.get('copy_course_structure'), {
    source_course_id: '4',
    target_course_id: '5',
    include_contents: 'off',
    include_groups: 'yes'
  }), {
    source_course_id: 4,
    target_course_id: 5,
    include_contents: 0,
    include_groups: 1
  });

  assert.throws(
    () => buildContractParameters(byName.get('apply_course_blueprint'), {
      course_id: 7,
      blueprint: []
    }),
    /blueprint must be a JSON object/
  );
  assert.throws(
    () => buildContractParameters(byName.get('set_course_publish_state'), {
      course_id: 7,
      publish_state: 'review'
    }),
    /publish_state must be one of: draft, ready, published, archived/
  );
});
