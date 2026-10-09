/* @layer tests @kind helper */
import type { Page } from 'playwright';
import { POLL_STEP_MS, POLL_TIMEOUT_MS } from './state-readers.constants';
import { readStates } from './read-states';

const awaitState = async (window: Page, match: RegExp, timeoutMs = POLL_TIMEOUT_MS): Promise<string> => {
  const deadline = Date.now() + timeoutMs;
  let last: string[] = [];
  for (;;) {
    last = await readStates(window);
    const hit = last.find((s) => match.test(s));
    if (hit) return hit;
    if (Date.now() >= deadline) break;
    await window.waitForTimeout(POLL_STEP_MS);
  }
  throw new Error(`no state chip matched ${match} within ${timeoutMs}ms; chips were ${JSON.stringify(last)}`);
};

export { awaitState };
