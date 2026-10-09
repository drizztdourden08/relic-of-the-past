/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { setStandingOverridesActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const clearStandingOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearStandingOverrides', null, [], []);
  setStandingOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All standing overrides cleared');
};

export { clearStandingOverrides };
