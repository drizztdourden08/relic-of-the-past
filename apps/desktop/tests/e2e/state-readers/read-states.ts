/* @layer tests @kind helper */
import type { Page } from 'playwright';

const sectionChips = (window: Page, title: string) =>
  window.locator(`xpath=//div[normalize-space(text())="${title}"]/../div/span`);

const readStates = async (window: Page): Promise<string[]> => {
  const chips = await sectionChips(window, 'States').allTextContents();
  return chips.map((c) => c.trim()).filter((c) => c.length > 0 && c !== 'none active');
};

export { readStates };
