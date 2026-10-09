/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule, setDropOverridesActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const clearDropOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearDropOverrides', null, [], []);
  setDropOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All drop overrides cleared');
};

export { clearDropOverrides };
