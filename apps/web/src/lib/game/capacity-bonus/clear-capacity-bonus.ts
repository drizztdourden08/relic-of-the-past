/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setCapacityHalf } from '../gate-word-5';
import { getModule } from '../wasm-bridge';
import { CAPACITY_BONUS_CLEARED } from './capacity-bonus.constants';

const clearCapacityBonus = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityBonus', null, [], []);
  setCapacityHalf(CAPACITY_BONUS_CLEARED);
  log.randomizer('[Randomizer] Capacity bonus cleared');
};

export { clearCapacityBonus };
