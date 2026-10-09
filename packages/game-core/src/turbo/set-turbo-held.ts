/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const setTurboHeld = (held: boolean): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetTurboHeld', null, ['number'], [held ? 1 : 0]);
  } catch {
    return;
  }
};

export { setTurboHeld };
