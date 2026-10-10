/* @layer tests @kind constants */
import { join } from 'path';
import { REPO_ROOT } from '../../repo-root';

const PROJECT_ROOT = REPO_ROOT;
const MAIN_JS = join(PROJECT_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
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
