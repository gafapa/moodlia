import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);

  const serviceId = await findMoodliaServiceId(page);
  await page.goto(new URL(`/admin/webservice/service.php?id=${serviceId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const enabled = page.locator('#id_enabled');
  if (!(await enabled.isChecked())) {
    await enabled.check();
  }

  const restricted = page.locator('#id_restrictedusers');
  if (!(await restricted.isChecked())) {
    await restricted.check();
  }

  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');
  console.log('MoodlIA service enabled and restricted to authorised users.');
} finally {
  await browser.close();
}
