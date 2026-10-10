/* @layer tests @kind helper */
import type { Page } from 'playwright';
import {
  awaitState, readCheckSummary, readFlood, readGroups, readRows, readScreenId, readStates, readTags,
} from '../state-readers';
import { KEYS, PRESS_GAP_MS, PRESS_HOLD_MS } from './state-harness.constants';
import type { StateReader } from './state-harness.type';
import { enableKeyboard } from './enable-keyboard';

const buildReader = (window: Page): StateReader => ({
  window,
  enableKeyboard: () => enableKeyboard(window),
  states: () => readStates(window),
  awaitState: (match, timeoutMs) => awaitState(window, match, timeoutMs),
  flood: () => readFlood(window),
  groups: () => readGroups(window),
  rows: () => readRows(window),
  tags: () => readTags(window),
  checkSummary: () => readCheckSummary(window),
  screenId: () => readScreenId(window),
  press: async (button, holdMs = PRESS_HOLD_MS) => {
    const key = KEYS[button] ?? button;
    await window.keyboard.down(key);
    await window.waitForTimeout(holdMs);
    await window.keyboard.up(key);
    await window.waitForTimeout(PRESS_GAP_MS);
  },
});

export { buildReader };
