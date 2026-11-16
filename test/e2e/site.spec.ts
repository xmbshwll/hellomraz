import { expect, test } from '@playwright/test';

test('skip link targets main content', async ({ page }) => {
  await page.goto('/');
  await page.locator('.skip-link').evaluate((element) => (element as HTMLElement).focus());
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('#main-content')).toHaveAttribute('tabindex', '-1');
});

test('mobile menu opens as dialog and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#mobile-sidebar-overlay')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('.mobile-sidebar-panel')).toHaveAttribute('role', 'dialog');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-sidebar-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('tag rows show album covers', async ({ page }) => {
  await page.goto('/tags/death$20metal');
  await expect(
    page.locator('.tag-post-row').first().locator('.tag-post-cover, .tag-post-cover-placeholder'),
  ).toBeVisible();
});

test('search page returns review results', async ({ page }) => {
  await page.goto('/search?q=arab+strap');
  await expect(page.locator('.search-page-result').first()).toContainText('Arab Strap');
});

test('album player does not overlap article content', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'mobile layout intentionally stacks player above content',
  );
  await page.goto('/blog/arabstrapband-half-told-tales/');
  const player = await page.locator('.post-page-player-slot').boundingBox();
  const content = await page.locator('.post-page-content').boundingBox();
  expect(player).not.toBeNull();
  expect(content).not.toBeNull();
  expect(player!.x + player!.width).toBeLessThanOrEqual(content!.x + 1);
});
