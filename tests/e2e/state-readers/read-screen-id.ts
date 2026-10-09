/* @layer tests @kind helper */
import type { Page } from 'playwright';

const readScreenId = async (window: Page): Promise<string> =>
  ((await window.locator('text=/screen-[0-9]{3} · /').first().textContent()) ?? '').trim();

export { readScreenId };
