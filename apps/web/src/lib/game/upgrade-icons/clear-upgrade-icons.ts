/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const clearUpgradeIcons = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearUpgradeIcons', null, [], []);
};

export { clearUpgradeIcons };
