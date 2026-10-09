/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { setWishPondPlanActive } from '../item-power';

const clearWishPondPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearWishPondPlan', null, [], []);
  setWishPondPlanActive(false);
  log.randomizer('[Randomizer] Wish pond plan cleared');
};

export { clearWishPondPlan };
