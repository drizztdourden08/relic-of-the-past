/**
 * FPS — read the current frame rate from the running WASM module.
 */

import { getModule } from './wasm-bridge';

/** Get current FPS from the WASM module. Returns 0 if not running or display perf is off. */
export function getFps(): number {
  const mod = getModule();
  if (!mod) return 0;
  try {
    return mod.ccall('WasmGetFps', 'number', [], []);
  } catch {
    return 0;
  }
}
