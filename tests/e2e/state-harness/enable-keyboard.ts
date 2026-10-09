/* @layer tests @kind helper */
import type { Page } from 'playwright';
import { KEYS } from './state-harness.constants';

const enableKeyboard = async (window: Page): Promise<void> => {
  const pairs = Object.entries(KEYS).map(([button, code]) => [code, button]);
  const bound = await window.evaluate((ps: [string, string][]) => {
    const im = (window as unknown as { __inputManager?: {
      keyboardMap: Map<string, string>;
      allowed: { keyboard: boolean };
    } }).__inputManager;
    if (!im) return 0;
    for (const [code, button] of ps) im.keyboardMap.set(code, button);
    im.allowed = { ...im.allowed, keyboard: true };
    return im.keyboardMap.size;
  }, pairs as [string, string][]);
  if (bound === 0) throw new Error('no __inputManager on the page, so input cannot be driven');
};

export { enableKeyboard };
