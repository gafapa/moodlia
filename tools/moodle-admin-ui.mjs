import { resolveMoodleUrl } from '../client/moodle-rest-client.mjs';
import { getEnv } from '../tests/helpers/env.mjs';

export async function loginAsConfiguredAdmin(page) {
  await page.goto(resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'login/index.php').toString());
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(getEnv('MOODLE_USERNAME'));
    await page.locator('#password').fill(getEnv('MOODLE_PASSWORD'));
    await page.locator('#loginbtn').click();
    await page.waitForLoadState('networkidle');
  }
}

export async function getAuthenticatedUser(page) {
  const user = await page.evaluate(() => ({
    id: Number(globalThis.M?.cfg?.userid ?? document.body?.dataset?.userid ?? 0),
    displayName: document.querySelector('.usertext')?.textContent?.trim() ?? ''
  }));

  if (!Number.isInteger(user.id) || user.id <= 0) {
    throw new Error('Could not resolve the authenticated Moodle user id.');
  }

  return {
    id: user.id,
    displayName: user.displayName || getEnv('MOODLE_USERNAME')
  };
}

export async function findMoodliaServiceId(page) {
  await page.goto(resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'admin/settings.php?section=externalservices').toString());
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
