/* @layer tests @kind constants */
import { join } from 'path';

const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const FIXTURES = join(PROJECT_ROOT, 'tests', 'fixtures', 'save-states');
const SETTLE_MS = 16_000;
const PRESS_HOLD_MS = 200;
const PRESS_GAP_MS = 200;
const KEYS: Readonly<Record<string, string>> = {
  Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight',
  A: 'KeyD', B: 'KeyS', X: 'KeyA', Y: 'KeyW', L: 'KeyQ', R: 'KeyE',
  Start: 'Enter', Select: 'ShiftRight',
};

export { FIXTURES, KEYS, MAIN_JS, PRESS_GAP_MS, PRESS_HOLD_MS, PROJECT_ROOT, SETTLE_MS };
