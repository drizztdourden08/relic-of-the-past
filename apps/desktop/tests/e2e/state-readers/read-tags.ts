/* @layer tests @kind helper */
import type { Page } from 'playwright';

const readTags = async (window: Page): Promise<string[]> =>
  (await window.locator('span[title^="tag 0x"]').allTextContents()).map((t) => t.trim());

export { readTags };
