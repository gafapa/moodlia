import { expect } from '@playwright/test';

export function getConfiguredCourseIds() {
  const combined = process.env.MOODLE_TEST_COURSE_IDS ?? '';

  return [...new Set(
    combined
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  )];
}

export function getConfiguredQuizModuleIds() {
  const combined = process.env.MOODLE_TEST_QUIZ_MODULE_IDS ?? process.env.MOODLE_TEST_QUIZ_MODULE_ID ?? '';

  return [...new Set(
    combined
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  )];
}

export async function loginAsConfiguredUser(page) {
  const username = process.env.MOODLE_USERNAME;
  const password = process.env.MOODLE_PASSWORD;
  const loginUrlPattern = /\/login\/index\.php(?:\?|$)/;

  if (!username || !password) {
    throw new Error('MOODLE_USERNAME and MOODLE_PASSWORD are required for browser tests.');
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto('/login/index.php', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });

    const usernameInput = page.locator('#username');
    const loginFormVisible = await usernameInput.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!loginFormVisible) {
      break;
    }

    await usernameInput.fill(username);
    await page.locator('#password').fill(password);
    await expect(page.locator('#loginbtn')).toBeEnabled();
    await Promise.all([
      page.waitForURL((url) => !loginUrlPattern.test(`${url.pathname}${url.search}`), { timeout: 10000 }).catch(() => {}),
      page.locator('#loginbtn').click()
    ]);
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    if (!loginUrlPattern.test(page.url())) {
      break;
    }
  }

  await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  await expect(page).not.toHaveURL(loginUrlPattern, { timeout: 10000 });
}

export async function expectMoodlePageLoaded(page) {
  await expect(page.locator('body')).toBeVisible();
  const pageContainer = page.locator('#page').first();
  if (await pageContainer.count()) {
    await expect(pageContainer).toBeVisible();
  }
}
