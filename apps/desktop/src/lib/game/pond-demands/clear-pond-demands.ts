/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const clearPondDemands = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearPondDemands', null, [], []);
  log.randomizer('[Randomizer] Pond demands cleared');
};

export { clearPondDemands };
