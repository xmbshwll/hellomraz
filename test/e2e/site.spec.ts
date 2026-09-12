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
  await expect(page.locator('.tag-post-row').first().locator('.tag-post-cover, .tag-post-cover-placeholder')).toBeVisible();
});

test('search page returns review results', async ({ page }) => {
  await page.goto('/search?q=arab+strap');
  await expect(page.locator('.search-page-result').first()).toContainText('Arab Strap');
});

test('album player does not overlap article content', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'mobile layout intentionally stacks player above content');
  await page.goto('/blog/arabstrapband-half-told-tales/');
  const player = await page.locator('.post-page-player-slot').boundingBox();
  const content = await page.locator('.post-page-content').boundingBox();
  expect(player).not.toBeNull();
  expect(content).not.toBeNull();
  expect(player!.x + player!.width).toBeLessThanOrEqual(content!.x + 1);
});

// Any value in [0, 1) works — the test derives its starting review from it.
const PINNED_RANDOM = 0.42;

test('random button opens a review', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Random album' }).click();
  await expect(page).toHaveURL(/\/blog\/.+/);
  await expect(page.locator('.post-page-content')).toBeVisible();
});

test('random button never lands on the review you are reading', async ({ page }) => {
  // Pin the RNG, then start on the very review the pick resolves to when
  // nothing is excluded — the one case where a missing exclusion would send
  // us back to ourselves instead of moving on.
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, PINNED_RANDOM);

  const index = await (await page.request.get('/api/search.json')).json();
  const currentSlug = index[Math.floor(PINNED_RANDOM * index.length)].slug as string;
  const pathname = () => new URL(page.url()).pathname.replace(/\/$/, '');

  await page.goto(`/blog/${currentSlug}/`);
  await page.getByRole('button', { name: 'Random album' }).click();

  await expect.poll(pathname).not.toBe(`/blog/${currentSlug}`);
  expect(pathname()).toMatch(/^\/blog\/.+/);
  await expect(page.locator('.post-page-content')).toBeVisible();
});

