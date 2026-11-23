import { test, expect } from '@playwright/test';

test('preview fits the viewport and journey navigation works', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Get hired for what you can actually do');
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/#journey$/);
  await expect(page.getByRole('heading', { name: 'From first step to first job.' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true });
});

test('same-origin API proxy reaches the NestJS backend', async ({ request }) => {
  const response = await request.get('/api/v1/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'dbi-api' });
});
