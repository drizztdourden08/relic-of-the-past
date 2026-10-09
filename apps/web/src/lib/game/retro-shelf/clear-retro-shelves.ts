/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const clearRetroShelves = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearRetroShelves', null, [], []);
};

export { clearRetroShelves };
