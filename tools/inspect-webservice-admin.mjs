import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';

loadEnvFile();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(new URL('/login/index.php', getEnv('MOODLE_BASE_URL')).toString());
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(getEnv('MOODLE_USERNAME'));
    await page.locator('#password').fill(getEnv('MOODLE_PASSWORD'));
    await page.locator('#loginbtn').click();
    await page.waitForLoadState('networkidle');
  }

  const query = process.env.MOODLE_ADMIN_SEARCH || 'External services';
  await page.goto(new URL(`/admin/search.php?query=${encodeURIComponent(query)}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const links = await page.locator('a').evaluateAll((items) =>
    items
      .map((item) => ({
        text: item.textContent?.trim() ?? '',
        href: item.href
      }))
      .filter((item) => /service|webservice|external/i.test(`${item.text} ${item.href}`))
      .slice(0, 30)
  );

  console.log(JSON.stringify({
    title: await page.title(),
    url: page.url(),
    links
  }, null, 2));
} finally {
  await browser.close();
}
