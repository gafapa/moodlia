import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { fromRoot } from '../tests/helpers/paths.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);
  const serviceId = await findMoodliaServiceId(page);

  await page.goto(new URL('/admin/webservice/tokens.php?action=create', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  await page.evaluate((currentServiceId) => {
    const userSelect = document.querySelector('#id_user');
    if (!userSelect) {
      throw new Error('Could not find the token user select field.');
    }
    userSelect.innerHTML = '<option value="2" selected>Admin User</option>';
    userSelect.value = '2';

    const serviceSelect = document.querySelector('#id_service');
    if (!serviceSelect) {
      throw new Error('Could not find the token service select field.');
    }
    serviceSelect.value = currentServiceId;
  }, serviceId);

  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');

  const token = await page.locator('body').evaluate((body) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      const text = row.innerText;
      if (/MoodlIA service/.test(text) && /Admin User|admin/i.test(text)) {
        const match = text.match(/\b[a-f0-9]{32}\b/i);
        if (match) {
          return match[0];
        }
      }
    }

    const fallback = body.innerText.match(/\b[a-f0-9]{32}\b/i);
    return fallback?.[0] ?? null;
  });

  if (!token) {
    console.error('Could not find the generated token on the Moodle token page.');
    process.exit(1);
  }

  const envPath = fromRoot('.env.test');
  const current = await fs.readFile(envPath, 'utf8');
  const next = current.includes('MOODLE_REST_TOKEN=')
    ? current.replace(/^MOODLE_REST_TOKEN=.*$/m, `MOODLE_REST_TOKEN=${token}`)
    : `${current.replace(/\s*$/, '')}\nMOODLE_REST_TOKEN=${token}\n`;

  await fs.writeFile(envPath, next, 'utf8');
  console.log('MoodlIA REST token created and stored in .env.test.');
} finally {
  await browser.close();
}
