import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);

  const serviceId = await findMoodliaServiceId(page);
  await page.goto(new URL(`/admin/webservice/service_users.php?id=${serviceId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const addSelect = page.locator('#addselect');
  const adminOption = addSelect.locator('option', { hasText: 'Admin User' });
  if (await adminOption.count()) {
    const adminValue = await adminOption.first().getAttribute('value');
    await addSelect.selectOption(adminValue);
    await page.locator('#add').click();
    await page.waitForLoadState('networkidle');
    console.log('Admin User authorised for MoodlIA service.');
  } else {
    console.log('Admin User was already authorised or not available in the add list.');
  }
} finally {
  await browser.close();
}
