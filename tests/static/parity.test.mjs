import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { fromRoot } from '../helpers/paths.mjs';
import {
  assertSameSet,
  getOperationsByTransport,
  loadContract,
  readJson,
  toKebabCase,
  toRestFunctionName
} from '../helpers/contract.mjs';

test('REST function manifest matches operations marked for REST', async () => {
  const contract = await loadContract();
  const manifest = await readJson('automation/manifests/rest-functions.json');
  const expected = getOperationsByTransport(contract, 'rest').map((operation) =>
    toRestFunctionName(contract, operation.name)
  );

  assertSameSet(manifest.functions, expected, 'REST functions');
});

test('Moodle db/services.php declares every REST operation from the contract', async () => {
  const contract = await loadContract();
  const servicesSource = await fs.readFile(fromRoot('plugin/moodlia/db/services.php'), 'utf8');
  const expected = getOperationsByTransport(contract, 'rest').map((operation) =>
    toRestFunctionName(contract, operation.name)
  );
  const declaredFunctions = [...servicesSource.matchAll(/^\s*'(local_moodlia_[a-z0-9_]+)'\s*=>\s*\[/gm)]
    .map((match) => match[1]);
  const serviceFunctionList = [...servicesSource.matchAll(/'((?:local_moodlia)_[a-z0-9_]+)'/g)]
    .map((match) => match[1]);

  assertSameSet(declaredFunctions, expected, 'db/services.php function declarations');
  for (const functionName of expected) {
    assert.ok(
      serviceFunctionList.includes(functionName),
      `${functionName} must be included in the MoodlIA service function list.`
    );
  }
});

test('PHP operation and external classes exist for every REST operation', async () => {
  const contract = await loadContract();

  for (const operation of getOperationsByTransport(contract, 'rest')) {
    const operationFile = fromRoot('plugin/moodlia/classes/operation', `${operation.name}.php`);
    const externalFile = fromRoot('plugin/moodlia/classes/external', `${operation.name}.php`);
    assert.ok((await fs.stat(operationFile)).isFile(), `${operationFile} must exist.`);
    assert.ok((await fs.stat(externalFile)).isFile(), `${externalFile} must exist.`);
  }
});

test('MCP tool manifest matches operations marked for MCP', async () => {
  const contract = await loadContract();
  const manifest = await readJson('automation/manifests/mcp-tools.json');
  const expected = getOperationsByTransport(contract, 'mcp').map((operation) => operation.name);

  assertSameSet(manifest.tools, expected, 'MCP tools');
});

test('MCP tools are dispatchable through REST-backed mcp.php', async () => {
  const contract = await loadContract();
  const mcpSource = await fs.readFile(fromRoot('plugin/moodlia/mcp.php'), 'utf8');
  const restOperations = new Set(getOperationsByTransport(contract, 'rest').map((operation) => operation.name));
  const mcpOperations = getOperationsByTransport(contract, 'mcp').map((operation) => operation.name);

  for (const operationName of mcpOperations) {
    assert.ok(restOperations.has(operationName), `${operationName} must support REST because MCP dispatch calls REST.`);
  }

  assert.match(
    mcpSource,
    /manifest::tool_names\(\)/,
    'mcp.php must validate requested tools against the MCP manifest.'
  );
  assert.match(
    mcpSource,
    /local_moodlia_mcp_call_rest\(\$token,\s*\$toolname,\s*\$arguments,\s*\$id\)/,
    'mcp.php must dispatch manifest tools through the shared REST operation name.'
  );
});

test('MCP tool schema manifest matches canonical enum parameters', async () => {
  const contract = await loadContract();
  const manifest = await readJson('automation/manifests/mcp-tool-schemas.json');

  for (const [operationName, parameterEnums] of Object.entries(manifest.tools)) {
    const operation = contract.operations.find((entry) => entry.name === operationName);
    assert.ok(operation, `${operationName} must exist in the contract.`);
    assert.ok(operation.transports.includes('mcp'), `${operationName} must support MCP.`);

    for (const [parameterName, expectedEnum] of Object.entries(parameterEnums)) {
      assert.deepEqual(
        operation.parameters[parameterName]?.enum,
        expectedEnum,
        `${operationName}.${parameterName} enum must match the MCP schema manifest.`
      );
    }
  }
});

test('PHP MCP manifest matches operations marked for MCP', async () => {
  const contract = await loadContract();
  const manifestSource = await fs.readFile(fromRoot('plugin/moodlia/classes/mcp/manifest.php'), 'utf8');
  const actual = [...manifestSource.matchAll(/'name'\s*=>\s*'([a-z][a-z0-9_]*)'/g)].map((match) => match[1]);
  const expected = getOperationsByTransport(contract, 'mcp').map((operation) => operation.name);

  assertSameSet(actual, expected, 'PHP MCP manifest tools');
});

test('PHP MCP manifest enum schemas match the canonical contract', async () => {
  const contract = await loadContract();
  const manifestSource = await fs.readFile(fromRoot('plugin/moodlia/classes/mcp/manifest.php'), 'utf8');

  for (const operation of getOperationsByTransport(contract, 'mcp')) {
    const enumParameters = Object.entries(operation.parameters ?? {}).filter(([, parameter]) =>
      Array.isArray(parameter.enum)
    );
    if (enumParameters.length === 0) {
      continue;
    }

    const toolPattern = new RegExp(`'name'\\s*=>\\s*'${operation.name}'[\\s\\S]*?(?=\\n\\s*\\[\\n\\s*'name'\\s*=>|\\n\\s*\\];\\n\\s*}\\n)`);
    const toolMatch = manifestSource.match(toolPattern);
    assert.ok(toolMatch, `${operation.name} must be present in the PHP MCP manifest.`);

    for (const [parameterName, parameter] of enumParameters) {
      const enumPattern = new RegExp(`'${parameterName}'\\s*=>\\s*\\[[\\s\\S]*?'enum'\\s*=>\\s*\\[([^\\]]*)\\]`);
      const enumMatch = toolMatch[0].match(enumPattern);
      assert.ok(enumMatch, `${operation.name}.${parameterName} must declare an enum in the PHP MCP manifest.`);
      const actualEnum = [...enumMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);

      assert.deepEqual(actualEnum, parameter.enum, `${operation.name}.${parameterName} enum must match the contract.`);
    }
  }
});

test('CLI command manifest matches operations marked for CLI', async () => {
  const contract = await loadContract();
  const manifest = await readJson('automation/manifests/cli-commands.json');
  const expected = getOperationsByTransport(contract, 'cli').map((operation) => toKebabCase(operation.name));

  assertSameSet(manifest.commands, expected, 'CLI commands');
});

test('read smoke operations are available on REST, MCP, and CLI', async () => {
  const contract = await loadContract();
  const required = ['get_current_user', 'get_courses', 'get_course_contents', 'get_course_details'];

  for (const operationName of required) {
    const operation = contract.operations.find((entry) => entry.name === operationName);
    assert.ok(operation, `${operationName} must exist in the contract.`);
    assert.equal(operation.type, 'read', `${operationName} must be a read operation.`);
    assert.ok(operation.transports.includes('rest'), `${operationName} must support REST.`);
    assert.ok(operation.transports.includes('mcp'), `${operationName} must support MCP.`);
    assert.ok(operation.transports.includes('cli'), `${operationName} must support CLI.`);
  }
});
