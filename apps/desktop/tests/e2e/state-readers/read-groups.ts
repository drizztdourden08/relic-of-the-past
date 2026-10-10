/* @layer tests @kind helper */
import type { Page } from 'playwright';

const readGroups = async (window: Page): Promise<Record<string, number>> => {
  const found = await window
    .locator('text=/^(Checks|Locks & barriers|Triggers|Unmapped) \\(\\d+\\)$/')
    .allTextContents();
  const out: Record<string, number> = {};
  for (const raw of found) {
    const m = /^(.+) \((\d+)\)$/.exec(raw.trim());
    const name = m?.[1];
    const count = m?.[2];
    if (name !== undefined && count !== undefined) out[name] = Number(count);
  }
  return out;
};

export { readGroups };
