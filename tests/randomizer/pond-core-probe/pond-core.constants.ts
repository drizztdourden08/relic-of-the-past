/* @layer tests @kind constants */
import { resolve } from 'node:path';
import { SRM_POND_THROWS } from '@app/lib/game/save-file/hook-save-bytes';

const ROOT = resolve(__dirname, '../../..');
const WASM_JS = resolve(ROOT, 'apps/desktop/public/wasm/zelda3.js');
const FIXTURE = resolve(ROOT, 'tests/fixtures/save-states/test-links-house.sav');

const FEATURES0_DEVELOPER_TOOLS = 1073741824;
const FEATURES3_POND_PLAN = 67108864;

const WRAM = {
  module: 0x10, submodule: 0x11, rupeesGoal: 0xf360, bombTier: 0xf370, arrowTier: 0xf371,
  pondThrows: SRM_POND_THROWS,
  pondGemReceipt: 0x1587a,
  immobilized: 0x2e4,
};

const POND_GEM_SLOTS = 10;
const CLOSED_COST = 0x7fff;
const UNARMED_LINE = -1;
const NO_PRIZE = -1;

export {
  CLOSED_COST, FEATURES0_DEVELOPER_TOOLS, FEATURES3_POND_PLAN, FIXTURE, NO_PRIZE, POND_GEM_SLOTS,
  UNARMED_LINE, WASM_JS, WRAM,
};
