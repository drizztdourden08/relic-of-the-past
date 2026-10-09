/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { setShopOverridesActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const clearShopSlotOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearShopSlotOverrides', null, [], []);
  setShopOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All shop slot overrides cleared');
};

export { clearShopSlotOverrides };
