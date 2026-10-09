/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const clearCurrencySymbols = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCurrencySymbols', null, [], []);
};

export { clearCurrencySymbols };
