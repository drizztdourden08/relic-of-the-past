/* @layer bridge-wasm @kind logic */
import type { PondPrizeArm } from './pond-plan.type';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';
import { getModule } from '../wasm-bridge';

const setPondPrize = (arm: PondPrizeArm): void => {
  const { prize, newItem, messageId, fireId } = arm;
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Pond prize refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (prize ${prize})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondPrize called with no active module');
    return;
  }
  mod.ccall('WasmSetPondPrize', null, ['number', 'number', 'number', 'number'],
    [prize, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Pond prize ${prize} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setPondPrize };
