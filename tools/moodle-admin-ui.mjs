import { getEnv } from '../tests/helpers/env.mjs';

export async function loginAsConfiguredAdmin(page) {
  await page.goto(new URL('/login/index.php', getEnv('MOODLE_BASE_URL')).toString());
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(getEnv('MOODLE_USERNAME'));
    await page.locator('#password').fill(getEnv('MOODLE_PASSWORD'));
    await page.locator('#loginbtn').click();
    await page.waitForLoadState('networkidle');
  }
}

export async function findMoodliaServiceId(page) {
  await page.goto(new URL('/admin/settings.php?section=externalservices', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const serviceId = await page.locator('body').evaluate((body) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      const text = row.innerText;
      if (!/MoodlIA service|local_moodlia/.test(text)) {
        continue;
      }

      const serviceLink = [...row.querySelectorAll('a')]
        .map((link) => link.href)
        .find((href) => /\/admin\/webservice\/service\.php\?id=\d+/.test(href));
      const match = serviceLink?.match(/[?&]id=(\d+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  });

  if (!serviceId) {
    throw new Error('Could not find the MoodlIA service id in Moodle external services.');
  }

  return serviceId;
}
