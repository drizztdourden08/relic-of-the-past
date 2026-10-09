/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const clearCapacityPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityPlan', null, [], []);
  log.randomizer('[Randomizer] Capacity plan cleared');
};

export { clearCapacityPlan };
