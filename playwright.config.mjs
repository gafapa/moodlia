import { defineConfig } from '@playwright/test';
import { loadEnvFile } from './tests/helpers/env.mjs';

loadEnvFile();

export default defineConfig({
  testDir: './tests/browser',
  timeout: Number(process.env.TEST_TIMEOUT_MS ?? 30000),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.MOODLE_BASE_URL || 'http://localhost',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ]
});
