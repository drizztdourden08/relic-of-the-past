/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const clearQuiverIcon = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearQuiverIcon', null, [], []);
};

export { clearQuiverIcon };
