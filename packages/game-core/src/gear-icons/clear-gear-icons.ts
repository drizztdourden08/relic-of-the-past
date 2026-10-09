/* @layer bridge-wasm @kind logic */
import { setGearArtActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings/reassert-gate-word-3';
import { getModule } from '../wasm-bridge';

const clearGearIcons = (): void => {
  setGearArtActive(false);
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearGearIcons', null, [], []);
  reassertGateWord3();
};

export { clearGearIcons };
