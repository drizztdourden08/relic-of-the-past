/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule, setItemOverridesActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const clearItemOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearItemOverrides', null, [], []);
  setItemOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All overrides cleared');
};

export { clearItemOverrides };
