import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';
import { fromRoot } from '../tests/helpers/paths.mjs';
import { findMoodliaServiceId, loginAsConfiguredAdmin } from './moodle-admin-ui.mjs';

loadEnvFile();

const restrictedUsername = getEnv('MOODLE_RESTRICTED_USERNAME') || 'moodlia_restricted_api';
const restrictedPassword = getEnv('MOODLE_RESTRICTED_PASSWORD') || `MoodlIA-${Date.now()}!`;
const restrictedEmail = getEnv('MOODLE_RESTRICTED_EMAIL') || `${restrictedUsername}@example.invalid`;
const roleShortname = getEnv('MOODLE_RESTRICTED_ROLE_SHORTNAME') || 'moodliarestrictedapi';
const roleName = 'MoodlIA restricted API user';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await loginAsConfiguredAdmin(page);

  const roleId = await ensureRestrictedRole(page);
  const userId = await ensureRestrictedUser(page);
  const serviceId = await findMoodliaServiceId(page);

  await ensureSystemRoleAssignment(page, roleId, userId);
  await ensureServiceUser(page, serviceId, userId);
  const token = await createRestrictedToken(page, serviceId, userId);
  await writeRestrictedToken(token);

  console.log(`Restricted MoodlIA token created for ${restrictedUsername} and stored in .env.test.`);
} finally {
  await browser.close();
}

async function ensureRestrictedRole(page) {
  const existing = await findRoleId(page, roleShortname);
  if (existing) {
    return existing;
  }

  await page.goto(new URL('/admin/roles/define.php?action=add', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');
  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');

  await page.locator('#shortname').fill(roleShortname);
  await page.locator('#name').fill(roleName);
  await page.locator('#description').fill('Allows a non-admin user to call MoodlIA external functions for permission-negative tests.');

  const systemContext = page.locator('input[type="checkbox"][name="contextlevel10"]');
  if (!(await systemContext.isChecked())) {
    await systemContext.check();
  }

  const useApiCapability = page.locator('input[type="checkbox"][name="local/moodlia:useapi"]');
  if (!(await useApiCapability.isChecked())) {
    await useApiCapability.check();
  }

  await page.locator('input[name="savechanges"]').first().click();
  await page.waitForLoadState('networkidle');

  const created = await findRoleId(page, roleShortname);
  if (!created) {
    throw new Error(`Could not create or find Moodle role ${roleShortname}.`);
  }

  return created;
}

async function findRoleId(page, shortname) {
  await page.goto(new URL('/admin/roles/manage.php', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  return page.locator('body').evaluate((body, expectedShortname) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      if (!row.innerText.includes(expectedShortname)) {
        continue;
      }

      const hrefs = [...row.querySelectorAll('a')].map((link) => link.href);
      for (const href of hrefs) {
        const match = href.match(/[?&]roleid=(\d+)/);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }, shortname);
}

async function ensureRestrictedUser(page) {
  const existing = await findUserId(page, restrictedUsername);
  if (existing) {
    return existing;
  }

  await page.goto(new URL('/user/editadvanced.php?id=-1', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  await page.locator('#id_username').fill(restrictedUsername);
  await page.locator('#id_auth').selectOption('manual');

  const createPassword = page.locator('#id_createpassword');
  if (await createPassword.isChecked()) {
    await createPassword.uncheck();
  }
  await page.locator('#id_newpassword').evaluate((input, password) => {
    input.value = password;
    input.classList.remove('d-none');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, restrictedPassword);

  const forcePasswordChange = page.locator('#id_preference_auth_forcepasswordchange');
  if (await forcePasswordChange.isChecked()) {
    await forcePasswordChange.uncheck();
  }

  await page.locator('#id_firstname').fill('MoodlIA');
  await page.locator('#id_lastname').fill('Restricted API');
  await page.locator('#id_email').fill(restrictedEmail);
  await page.locator('#id_city').fill('Test');
  await page.locator('#id_country').selectOption('ES');
  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');

  const created = await findUserId(page, restrictedUsername);
  if (!created) {
    throw new Error(`Could not create or find Moodle user ${restrictedUsername}.`);
  }

  return created;
}

async function findUserId(page, username) {
  await page.goto(new URL(`/admin/user.php?search=${encodeURIComponent(username)}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  return page.locator('body').evaluate((body, expectedUsername) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      if (!row.innerText.toLowerCase().includes(expectedUsername.toLowerCase())) {
        continue;
      }

      const hrefs = [...row.querySelectorAll('a')].map((link) => link.href);
      for (const href of hrefs) {
        const match = href.match(/\/user\/(?:profile|editadvanced)\.php\?id=(\d+)/);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }, username);
}

async function ensureSystemRoleAssignment(page, roleId, userId) {
  await page.goto(new URL(`/admin/roles/assign.php?contextid=1&roleid=${roleId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const alreadyAssigned = await page.locator('#removeselect').evaluate((select, expectedUserId) =>
    [...select.options].some((option) => option.value === String(expectedUserId)),
    String(userId)
  );
  if (alreadyAssigned) {
    return;
  }

  await injectSelectOption(page, '#addselect', userId, restrictedUsername);
  await page.locator('#add').evaluate((button) => {
    button.disabled = false;
  });
  await page.locator('#add').click();
  await page.waitForLoadState('networkidle');
}

async function ensureServiceUser(page, serviceId, userId) {
  await page.goto(new URL(`/admin/webservice/service_users.php?id=${serviceId}`, getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const alreadyAuthorized = await page.locator('#removeselect').evaluate((select, expectedUserId) =>
    [...select.options].some((option) => option.value === String(expectedUserId)),
    String(userId)
  ).catch(() => false);
  if (alreadyAuthorized) {
    return;
  }

  await injectSelectOption(page, '#addselect', userId, restrictedUsername);
  await page.locator('#add').evaluate((button) => {
    button.disabled = false;
  });
  await page.locator('#add').click();
  await page.waitForLoadState('networkidle');
}

async function createRestrictedToken(page, serviceId, userId) {
  await page.goto(new URL('/admin/webservice/tokens.php', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  const existingToken = await page.locator('body').evaluate((body, currentUsername) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      const text = row.innerText;
      if (text.includes(currentUsername) && /MoodlIA service|local_moodlia/i.test(text)) {
        const match = text.match(/\b[a-f0-9]{32}\b/i);
        if (match) {
          return match[0];
        }
      }
    }

    return null;
  }, restrictedUsername);
  if (existingToken) {
    return existingToken;
  }

  await page.goto(new URL('/admin/webservice/tokens.php?action=create', getEnv('MOODLE_BASE_URL')).toString());
  await page.waitForLoadState('networkidle');

  await page.locator('#id_name').fill('MoodlIA restricted permission smoke');
  await page.evaluate(({ currentServiceId, currentUserId, currentUsername }) => {
    const userSelect = document.querySelector('#id_user');
    if (!userSelect) {
      throw new Error('Could not find the token user select field.');
    }
    userSelect.innerHTML = `<option value="${currentUserId}" selected>${currentUsername}</option>`;
    userSelect.value = String(currentUserId);

    const serviceSelect = document.querySelector('#id_service');
    if (!serviceSelect) {
      throw new Error('Could not find the token service select field.');
    }
    serviceSelect.value = String(currentServiceId);
  }, {
    currentServiceId: serviceId,
    currentUserId: userId,
    currentUsername: restrictedUsername
  });

  await page.locator('#id_submitbutton').click();
  await page.waitForLoadState('networkidle');

  const token = await page.locator('body').evaluate((body, currentUsername) => {
    const rows = [...body.querySelectorAll('tr')];
    for (const row of rows) {
      const text = row.innerText;
      if (text.includes(currentUsername)) {
        const match = text.match(/\b[a-f0-9]{32}\b/i);
        if (match) {
          return match[0];
        }
      }
    }

    return body.innerText.match(/\b[a-f0-9]{32}\b/i)?.[0] ?? null;
  }, restrictedUsername);

  if (!token) {
    throw new Error('Could not find the generated restricted token on the Moodle token page.');
  }

  return token;
}

async function injectSelectOption(page, selector, value, label) {
  await page.locator(selector).evaluate((select, optionData) => {
    select.innerHTML = `<option value="${optionData.value}" selected>${optionData.label}</option>`;
    select.value = String(optionData.value);
  }, {
    value: String(value),
    label
  });
}

async function writeRestrictedToken(token) {
  const envPath = fromRoot('.env.test');
  const current = await fs.readFile(envPath, 'utf8');
  const next = current.includes('MOODLE_RESTRICTED_REST_TOKEN=')
    ? current.replace(/^MOODLE_RESTRICTED_REST_TOKEN=.*$/m, `MOODLE_RESTRICTED_REST_TOKEN=${token}`)
    : `${current.replace(/\s*$/, '')}\nMOODLE_RESTRICTED_REST_TOKEN=${token}\n`;

  await fs.writeFile(envPath, next, 'utf8');
}
