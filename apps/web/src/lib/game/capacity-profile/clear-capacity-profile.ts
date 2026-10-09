/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { setCapacityProfileActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const clearCapacityProfile = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityProfile', null, [], []);
  mod.ccall('WasmClearWalletJumpTable', null, [], []);
  setCapacityProfileActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] Capacity profile cleared');
};

export { clearCapacityProfile };
