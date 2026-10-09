/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { setScriptedGrantsActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const clearScriptedGrantOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearScriptedGrantOverrides', null, [], []);
  setScriptedGrantsActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All scripted grant overrides cleared');
};

export { clearScriptedGrantOverrides };
