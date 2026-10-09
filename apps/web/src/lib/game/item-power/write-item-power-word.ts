/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { ITEM_POWER_GATE_WORD } from './item-power.constants';

const writeItemPowerWord = (word: number): void => {
  const mod = getModule();
  if (!mod) {
    if (word !== 0) log.error('[Randomizer] setItemPower called with no active module');
    return;
  }
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [ITEM_POWER_GATE_WORD, word]);
  } catch {
    log.error('[Randomizer] Item power refused: this core has no gate word 4');
  }
};

export { writeItemPowerWord };
