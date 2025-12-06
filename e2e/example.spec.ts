import { test, expect } from '@playwright/test';

test('homepage loads and has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Chest Idle');
  await expect(page.locator('#app')).toBeVisible();
});
