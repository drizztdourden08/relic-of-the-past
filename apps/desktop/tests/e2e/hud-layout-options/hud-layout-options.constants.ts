/* @layer tests @kind constants */
import { join } from 'path';
import { REPO_ROOT } from '../../repo-root';

const PROJECT_ROOT = REPO_ROOT;
const MAIN_JS = join(PROJECT_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
const LAYOUT_INSTANCE = 'layout-options';
const SHOTS = join(PROJECT_ROOT, 'tests', 'screenshots', 'layout-options');
const SETTLE_MS = 260;
const CLICK_SETTLE_MS = 300;

const LAYOUT = 'Container';
const FLOW = 'Flow';
const ALIGN = 'Alignment';
const GRID_MANIP = 'Grid manipulation';
const FLEX_MANIP = 'Flex manipulation';

const COL_HEAD = '.hud-lattice__head:not(.hud-lattice__head--row)';
const ROW_HEAD = '.hud-lattice__head--row';

export {
  ALIGN, CLICK_SETTLE_MS, COL_HEAD, FLEX_MANIP, FLOW, GRID_MANIP, LAYOUT, LAYOUT_INSTANCE, MAIN_JS, PROJECT_ROOT,
  ROW_HEAD, SETTLE_MS, SHOTS,
};
