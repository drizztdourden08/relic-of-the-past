/* @layer renderer-lib @kind constants */
import type { MsuChannelName } from '../channel';

const MODULE_INTRO = 0;
const MODULE_FILE_SELECT = 1;
const MODULE_COPY_FILE = 2;
const MODULE_KILL_FILE = 3;
const MODULE_NAME_FILE = 4;
const MODULE_ATTRACT = 20;

const TITLE_MODULES: ReadonlySet<number> = new Set([
  MODULE_INTRO,
  MODULE_FILE_SELECT,
  MODULE_COPY_FILE,
  MODULE_KILL_FILE,
  MODULE_NAME_FILE,
  MODULE_ATTRACT,
]);

const SILENCED: readonly MsuChannelName[] = ['ambient', 'sfx1', 'sfx2'];

export {
  MODULE_INTRO, MODULE_FILE_SELECT, MODULE_COPY_FILE, MODULE_KILL_FILE, MODULE_NAME_FILE, MODULE_ATTRACT,
  TITLE_MODULES, SILENCED,
};
