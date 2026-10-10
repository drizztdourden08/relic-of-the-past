/* @layer tests @kind helper */
import type { Page } from 'playwright';
import { FLOOD_SETTLE_LIMIT_MS, POLL_STEP_MS, POLL_TIMEOUT_MS } from './state-readers.constants';

const readFlood = async (window: Page): Promise<{ reachable: number; total: number }> => {
  await window.getByTestId('nav-flood-btn').dispatchEvent('click');
  const label = window.locator('text=/^\\d+\\/\\d+ \\(\\d+%\\)$/').first();
  await label.waitFor({ state: 'visible', timeout: POLL_TIMEOUT_MS });
  let text = '';
  const deadline = Date.now() + FLOOD_SETTLE_LIMIT_MS;
  while (Date.now() < deadline) {
    const next = (await label.textContent())?.trim() ?? '';
    if (next && next === text) break;
    text = next;
    await window.waitForTimeout(POLL_STEP_MS);
  }
  const m = /^(\d+)\/(\d+) \(\d+%\)$/.exec(text);
  if (!m) throw new Error(`unreadable flood label: ${JSON.stringify(text)}`);
  return { reachable: Number(m[1]), total: Number(m[2]) };
};

export { readFlood };
