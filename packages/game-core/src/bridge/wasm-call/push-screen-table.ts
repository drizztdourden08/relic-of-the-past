/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';

const pushScreenTable = (mod: EmscriptenModule, cId: number, bytes: Uint8Array): boolean => {
  const ptr = mod.ccall('malloc', 'number', ['number'], [bytes.length]);
  if (ptr === 0) return false;
  mod.HEAPU8.set(bytes, ptr);
  const taken = mod.ccall('WasmSetLanguageScreenTable', 'number', ['number', 'number', 'number'], [cId, ptr, bytes.length]);
  mod.ccall('free', null, ['number'], [ptr]);
  return taken === 1;
};

export { pushScreenTable };
