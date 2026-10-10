/* @layer tests @kind helper */
import type { Page } from 'playwright';
import type { CheckSummary } from './state-readers.type';

const readCheckSummary = async (window: Page): Promise<CheckSummary> => {
  const one = async (word: string): Promise<number> => {
    const hits = await window.locator(`text=/^\\d+ ${word}$/`).allTextContents();
    return Number(/^(\d+)/.exec(hits[0]?.trim() ?? '')?.[1] ?? 0);
  };
  return { done: await one('done'), available: await one('available'), blocked: await one('unreachable') };
};

export { readCheckSummary };
