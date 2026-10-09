/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { reassertGateWord3 } from '../live-settings';
import { setNpcOverridesActive, getModule } from '@rotp/game-core';

const clearNpcGrantOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearNpcGrantOverrides', null, [], []);
  setNpcOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All npc overrides cleared');
};

export { clearNpcGrantOverrides };
