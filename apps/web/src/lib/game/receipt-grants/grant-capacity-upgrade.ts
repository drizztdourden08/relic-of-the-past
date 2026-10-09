/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { armReceiptGates } from './arm-receipt-gates';

const grantCapacityUpgrade = (kind: 0 | 1, amount: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] grantCapacityUpgrade called with no active module');
    return;
  }
  armReceiptGates();
  mod.ccall('WasmGrantCapacityUpgrade', null, ['number', 'number'], [kind, amount]);
  log.randomizer(`[Randomizer] Capacity upgrade requested: kind=${kind} amount=${amount}`);
};

export { grantCapacityUpgrade };
