/* @layer bridge-wasm @kind logic */
import { getModule } from './wasm-bridge';

const getFps = (): number => {
  const mod = getModule();
  if (!mod) return 0;
  try {
    return mod.ccall('WasmGetFps', 'number', [], []);
  } catch {
    return 0;
  }
};

export { getFps };
