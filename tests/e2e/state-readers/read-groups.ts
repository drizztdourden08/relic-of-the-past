/* @layer tests @kind helper */
import type { Page } from 'playwright';

const readGroups = async (window: Page): Promise<Record<string, number>> => {
  const found = await window
    .locator('text=/^(Checks|Locks & barriers|Triggers|Unmapped) \\(\\d+\\)$/')
    .allTextContents();
  const out: Record<string, number> = {};
  for (const raw of found) {
    const m = /^(.+) \((\d+)\)$/.exec(raw.trim());
    if (m) out[m[1]] = Number(m[2]);
  }
  return out;
};

export { readGroups };
