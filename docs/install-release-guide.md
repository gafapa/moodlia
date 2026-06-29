# Install And Release Guide

This guide describes how to install, verify, and release MoodlIA in another Moodle instance.

## Release Scope

MoodlIA is a Moodle local plugin with component `local_moodlia` and folder name `moodlia`.

The first release uses Moodle core structures only:

- No plugin-owned database tables.
- No `db/install.xml`.
- No direct SQL or `$DB` access in plugin behavior.
- REST functions are declared in `db/services.php`.
- MCP uses the same Moodle REST token and the same canonical operations.
- The Node CLI calls Moodle REST directly.

## Prerequisites

The target Moodle instance must provide:

- Moodle web access.
- Moodle admin access for installing/upgrading the plugin.
- A web service token authorised for the `local_moodlia` external service.
- SFTP/SSH or equivalent file deployment access.
- PHP CLI access for Moodle upgrade and cache purge, or admin web access to trigger upgrade.

Recommended local tools:

- Node.js 22 or newer.
- npm.
- WinSCP on Windows when using a `.ppk` private key.
- Playwright browsers for UI verification.

## Environment

Create a target-specific env file from `.env.example`:

```text
MOODLE_BASE_URL=https://moodle.example.edu
MOODLE_USERNAME=admin
MOODLE_PASSWORD=...
MOODLE_REST_SERVICE=local_moodlia
MOODLE_REST_TOKEN=...
MOODLE_MCP_ENDPOINT=https://moodle.example.edu/local/moodlia/mcp.php
PLAYWRIGHT_BASE_URL=https://moodle.example.edu
SFTP_HOST=example.edu
SFTP_PORT=22
SFTP_USER=ubuntu
SFTP_KEY_PATH=C:\path\to\key.ppk
LOCAL_PLUGIN_SOURCE=plugin/moodlia
LOCAL_PLUGIN_PACKAGE_PATH=D:\tmp\moodlia
SFTP_REMOTE_UPLOAD_PATH=/tmp/moodlia
MOODLE_DOCKER_CONTAINER=moodle
MOODLE_CONTAINER_CLI_ROOT=/var/www/html
MOODLE_CONTAINER_ROOT=/var/www/html/public
MOODLE_CONTAINER_PLUGIN_PATH=/var/www/html/public/local/moodlia
```

Do not commit env files that contain credentials or tokens.

## Preflight

Run the local release check before uploading:

```text
npm install
npm run release:check
```

The release check validates generated manifests, generated TypeScript operation types, static parity, forbidden database-access patterns, key smoke-test syntax, browser-test syntax, and plugin packaging.

Use a faster preflight while iterating:

```text
node tools/release-check.mjs --skip-package
```

## Package

Create the deployable plugin folder:

```text
npm run plugin:package
```

By default this copies `plugin/moodlia` to `LOCAL_PLUGIN_PACKAGE_PATH`.

The package excludes development-only folders and local secrets.

## Deploy

For the configured WinSCP target:

```text
npm run deploy:winscp:test
npm run deploy:winscp
```

The final plugin path in the Moodle container must be:

```text
/var/www/html/public/local/moodlia
```

The Moodle upgrade command must run from the Moodle CLI root:

```text
sudo docker exec -w /var/www/html/public moodle php admin/cli/upgrade.php --non-interactive
sudo docker exec -w /var/www/html/public moodle php admin/cli/purge_caches.php
```

Some Docker images expose Moodle CLI paths from `/var/www/html`; use the path that actually contains `admin/cli` in the target deployment.

## Verify

Run static checks locally:

```text
npm run test:static
npm run manifests:check
npm run types:check
```

Run focused remote smoke tests:

```text
node --test tests/smoke/api.test.mjs
node --test tests/smoke/transport-parity.test.mjs
node --test tests/smoke/module-completion-matrix.test.mjs
node --test tests/smoke/module-custom-completion-rules.test.mjs
```

Run broad remote smoke tests when the target can tolerate generated test data:

```text
npm run test:smoke
```

Run browser verification:

```text
npm run test:browser
```

Browser tests require `MOODLE_USERNAME`, `MOODLE_PASSWORD`, and either `PLAYWRIGHT_BASE_URL` or `MOODLE_BASE_URL`.

## Demo Course

Create a rich demo course without deleting existing courses:

```text
npm run moodle:create-demo-course
```

The output is JSON with the generated course id, category id, activity ids, question categories, question ids, quiz slots, file ids, and verification payloads.

Only use the reset command on disposable Moodle instances:

```text
npm run moodle:reset-full-course
```

This deletes every manageable course returned by the API before creating the demo course.

## Rollback

Before each release:

- Record the currently deployed plugin version.
- Keep a copy of the previously deployed `local/moodlia` folder.
- Confirm whether the release contains schema changes.

Current MoodlIA releases do not create plugin-owned schema, so rollback is file-based:

1. Re-upload the previous `moodlia` folder.
2. Run Moodle upgrade.
3. Purge caches.
4. Run the focused smoke tests.

Moodle does not support arbitrary plugin downgrades as a normal workflow. Plan rollback before deploying.

## Release Checklist

- `npm run release:check` passes.
- Deployment target paths are confirmed.
- Secrets are not committed.
- Plugin is packaged from `plugin/moodlia`.
- Plugin is deployed to `/local/moodlia`.
- Moodle upgrade and cache purge complete.
- REST smoke passes.
- MCP smoke or transport parity passes.
- CLI smoke or transport parity passes.
- Browser verification passes for generated Moodle-visible state.
- Generated failed-test courses are cleaned up.
