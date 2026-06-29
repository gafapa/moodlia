import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageDirectory = path.join(rootDirectory, 'packages', 'moodlia');
const checkOnly = process.argv.includes('--check');

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(relativePath) {
  const raw = await fs.readFile(path.join(rootDirectory, relativePath), 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

async function readText(relativePath) {
  return fs.readFile(path.join(rootDirectory, relativePath), 'utf8');
}

function npmContract(contract) {
  return {
    ...contract,
    operations: contract.operations
      .filter((operation) => operation.transports.includes('cli'))
      .map((operation) => ({
        ...operation,
        transports: operation.transports.filter((transport) => transport !== 'mcp'),
        tests: Array.isArray(operation.tests)
          ? operation.tests.filter((testName) => testName !== 'mcp')
          : operation.tests
      }))
  };
}

function npmPackageJson(rootPackageJson) {
  return {
    name: 'moodlia',
    version: rootPackageJson.version,
    description: 'Command-line client for the MoodlIA Moodle REST API.',
    type: 'module',
    license: 'GPL-3.0-or-later',
    bin: {
      moodlia: 'cli/moodlia.mjs'
    },
    exports: {
      '.': {
        types: './client/moodle-rest-client.d.ts',
        import: './client/moodle-rest-client.mjs'
      },
      './contract': './contract/operations.json'
    },
    files: [
      'cli/',
      'client/',
      'contract/',
      'README.md'
    ],
    keywords: [
      'moodle',
      'moodlia',
      'cli',
      'rest',
      'automation'
    ],
    engines: {
      node: '>=22'
    },
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org'
    }
  };
}

function npmReadme() {
  return `# moodlia

Command-line client for the MoodlIA Moodle REST API.

This package contains only the Node CLI and the REST client needed by external users. It does not include the Moodle plugin, server tools, tests, or browser automation.

## Requirements

- Node.js 22 or newer.
- A Moodle site with the MoodlIA local plugin installed.
- A Moodle REST token enabled for the MoodlIA web service.

## Installation

\`\`\`bash
npm install -g moodlia
\`\`\`

## Configuration

Set the Moodle URL and REST token in your shell:

\`\`\`bash
export MOODLE_BASE_URL="https://your-moodle.example"
export MOODLE_REST_TOKEN="your-token"
\`\`\`

On Windows PowerShell:

\`\`\`powershell
$env:MOODLE_BASE_URL = "https://your-moodle.example"
$env:MOODLE_REST_TOKEN = "your-token"
\`\`\`

The CLI also reads a local \`.env\` file from the current working directory when present:

\`\`\`text
MOODLE_BASE_URL=https://your-moodle.example
MOODLE_REST_TOKEN=your-token
\`\`\`

## Usage

\`\`\`bash
moodlia get-current-user
moodlia get-courses --limit 10
moodlia create-course-category --name "Generated Courses" --visible true
moodlia create-module --course-id 42 --section-number 1 --module-type page --name "Reading" --options "{\\"content\\":\\"<p>Hello</p>\\"}"
\`\`\`

All commands return JSON. Errors are written to stderr as JSON with \`error\`, \`code\`, \`message\`, and \`details\`.

Show all commands:

\`\`\`bash
moodlia --help
\`\`\`

Show command options:

\`\`\`bash
moodlia create-module --help
\`\`\`

## Development Sync

This package is generated from the main MoodlIA development repository with:

\`\`\`bash
npm run npm:sync
\`\`\`

Do not edit generated files in this package manually. Change the root CLI, REST client, or canonical contract, then sync again.
`;
}

function npmCli(source) {
  return source
    .replaceAll('moodle-mcp', 'moodlia')
    .replace(
      "loadEnvFile(path.join(rootDirectory, '.env.test'));",
      "loadEnvFile(path.join(process.cwd(), '.env'));\n  loadEnvFile(path.join(rootDirectory, '.env'));"
    );
}

async function collectExpectedFiles() {
  const rootPackageJson = await readJson('package.json');
  const contract = await readJson('contract/operations.json');
  const cliSource = await readText('cli/moodle-mcp.mjs');

  return new Map([
    ['package.json', stableJson(npmPackageJson(rootPackageJson))],
    ['README.md', npmReadme()],
    ['cli/moodlia.mjs', npmCli(cliSource)],
    ['client/moodle-rest-client.mjs', await readText('client/moodle-rest-client.mjs')],
    ['client/moodle-rest-client.d.ts', await readText('client/moodle-rest-client.d.ts')],
    ['client/generated/operation-types.d.ts', await readText('client/generated/operation-types.d.ts')],
    ['contract/operations.json', stableJson(npmContract(contract))]
  ]);
}

async function writePackage(files) {
  const resolvedPackageDirectory = path.resolve(packageDirectory);
  const expectedPrefix = path.join(rootDirectory, 'packages');
  if (!resolvedPackageDirectory.startsWith(expectedPrefix)) {
    throw new Error(`Refusing to sync outside packages directory: ${resolvedPackageDirectory}`);
  }

  await fs.rm(resolvedPackageDirectory, { recursive: true, force: true });
  for (const [relativePath, content] of files) {
    const target = path.join(resolvedPackageDirectory, relativePath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
}

async function checkPackage(files) {
  const stale = [];
  for (const [relativePath, expected] of files) {
    const target = path.join(packageDirectory, relativePath);
    try {
      const actual = await fs.readFile(target, 'utf8');
      if (actual.replace(/\r\n/g, '\n') !== expected.replace(/\r\n/g, '\n')) {
        stale.push(relativePath);
      }
    } catch {
      stale.push(relativePath);
    }
  }

  if (stale.length > 0) {
    throw new Error(`npm package is stale. Run npm run npm:sync. Stale files: ${stale.join(', ')}`);
  }
}

async function main() {
  const files = await collectExpectedFiles();
  if (checkOnly) {
    await checkPackage(files);
    return;
  }

  await writePackage(files);
  console.log(`Synced npm package to ${path.relative(rootDirectory, packageDirectory)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
