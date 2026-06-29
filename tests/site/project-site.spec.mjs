import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const siteUrl = pathToFileURL(path.resolve('site/index.html')).toString();

test.beforeEach(async ({ page }) => {
  await page.goto(siteUrl);
});

test('project website exposes installer and technical sections', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'One Moodle operation surface for REST, MCP, and a Node CLI.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install the plugin in a Moodle Docker deployment.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Package, deploy, verify, and generate a demo course.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Technical model' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Built for Moodle standards first.' })).toBeVisible();
});

test('copy command control reports status', async ({ page }) => {
  await page.getByLabel('Install the plugin in a Moodle Docker deployment.').getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('status')).toContainText(/Commands copied|Clipboard is not available/);
});

test('layout remains readable on mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByText('/var/www/html/public/local/moodlia', { exact: true })).toBeVisible();
});
