/* @layer test @kind constants */
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../repo-root';

const ROOT = REPO_ROOT;
const FEATURES0_DEVELOPER_TOOLS = 1073741824;
const WRAM_SIZE = 0x20000;
const SRAM_BASE = 0xf000;
const SRAM_SIZE = 0x500;
const SAVE_STATE_FIXTURES = resolve(ROOT, 'tests/fixtures/save-states');

export { FEATURES0_DEVELOPER_TOOLS, ROOT, SAVE_STATE_FIXTURES, SRAM_BASE, SRAM_SIZE, WRAM_SIZE };
