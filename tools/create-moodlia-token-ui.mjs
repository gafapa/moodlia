import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { resolveMoodleUrl } from '../client/moodle-rest-client.mjs';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { fromRoot } from '../tests/helpers/paths.mjs';
import { findMoodliaServiceId, getAuthenticatedUser, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);
  const serviceId = await findMoodliaServiceId(page);
  const authenticatedUser = await getAuthenticatedUser(page);

  await page.goto(resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'admin/webservice/tokens.php?action=create').toString());
  await page.waitForLoadState('networkidle');

  await page.evaluate(({ currentServiceId, currentUser }) => {
    const userSelect = document.querySelector('#id_user');
    if (!userSelect) {
      throw new Error('Could not find the token user select field.');
    }
    const option = document.createElement('option');
    option.value = String(currentUser.id);
    option.textContent = currentUser.displayName;
    option.selected = true;
    userSelect.replaceChildren(option);
    userSelect.value = String(currentUser.id);

    const serviceSelect = document.querySelector('#id_service');
    if (!serviceSelect) {
      throw new Error('Could not find the token service select field.');
    }
    serviceSelect.value = currentServiceId;
  }, { currentServiceId: serviceId, currentUser: authenticatedUser });

  const tokenName = 'MoodlIA automation token';
  const nameInput = page.locator('#id_name');
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill(tokenName);
  }

  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');

  const token = await page.locator('body').evaluate((body, expected) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      const text = row.innerText;
      const normalized = text.toLowerCase();
      const displayNameMatches = expected.displayName && normalized.includes(expected.displayName.toLowerCase());
      const usernameMatches = expected.username && normalized.includes(expected.username.toLowerCase());
      if (
        /MoodlIA service/i.test(text) &&
        (displayNameMatches || usernameMatches)
      ) {
        const match = text.match(/\b[a-f0-9]{32}\b/i);
        if (match) {
          return match[0];
        }
      }
    }

    return null;
  }, {
    displayName: authenticatedUser.displayName,
    username: getEnv('MOODLE_USERNAME') || ''
  });

  if (!token) {
    console.error('Could not find the generated token on the Moodle token page.');
    process.exit(1);
  }

  const envPath = fromRoot('.env.test');
  const current = await fs.readFile(envPath, 'utf8').catch((error) =>
    error.code === 'ENOENT' ? '' : Promise.reject(error)
  );
  const next = current.includes('MOODLE_REST_TOKEN=')
    ? current.replace(/^MOODLE_REST_TOKEN=.*$/m, `MOODLE_REST_TOKEN=${token}`)
    : `${current.replace(/\s*$/, '')}\nMOODLE_REST_TOKEN=${token}\n`;

  await fs.writeFile(envPath, next, 'utf8');
  await fs.chmod(envPath, 0o600).catch(() => {});
  console.log('MoodlIA REST token created and stored in .env.test.');
} finally {
  await browser.close();
}
