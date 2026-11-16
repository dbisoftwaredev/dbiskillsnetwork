import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://localhost:3000', channel: 'chromium' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    { command: 'npm.cmd start -w backend', url: 'http://127.0.0.1:3001/api/v1/health', reuseExistingServer: false },
    { command: 'npm.cmd start -w frontend', url: 'http://localhost:3000', reuseExistingServer: false },
  ],
});
