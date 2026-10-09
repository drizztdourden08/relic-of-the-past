/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';

const clearPondDemands = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearPondDemands', null, [], []);
  log.randomizer('[Randomizer] Pond demands cleared');
};

export { clearPondDemands };
