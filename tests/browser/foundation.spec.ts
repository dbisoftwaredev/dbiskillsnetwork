import { test, expect } from '@playwright/test';

test('preview fits the viewport and journey navigation works', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Africa's home for discovering skills, talent and opportunities.");
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/#journey$/);
  await expect(page.getByRole('heading', { name: 'From first step to first job.' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true });
});

test('mobile and desktop hero headline stays on two lines without horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const headline = page.getByRole('heading', { level: 1 });
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const lineCount = await headline.evaluate((element) => {
      const wordLines = [...element.querySelectorAll('.word')].map((word) => Math.round(word.getBoundingClientRect().top));
      return new Set(wordLines).size;
    });

    expect(lineCount).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('same-origin API proxy reaches the NestJS backend', async ({ request }) => {
  const response = await request.get('/api/v1/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'dbi-api' });
});
