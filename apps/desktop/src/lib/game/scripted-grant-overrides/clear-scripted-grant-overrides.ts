/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { setScriptedGrantsActive } from '@rotp/game-core';
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
