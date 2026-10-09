/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { setPondPlanActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const clearPondPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearPondPlan', null, [], []);
  setPondPlanActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] Pond plan cleared');
};

export { clearPondPlan };
