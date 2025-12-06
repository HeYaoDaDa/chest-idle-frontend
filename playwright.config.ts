import { defineConfig, devices } from '@playwright/test';

// Playwright configuration for E2E tests
export default defineConfig({
  testDir: 'e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run preview -- --port 4173',
    port: 4173,
    timeout: 120 * 1000,
    reuseExistingServer: false,
  },
});
