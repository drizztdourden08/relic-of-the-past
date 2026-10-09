/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const clearProgressiveTiers = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearProgressiveTiers', null, [], []);
  log.randomizer('[Randomizer] Progressive tiers cleared');
};

export { clearProgressiveTiers };
