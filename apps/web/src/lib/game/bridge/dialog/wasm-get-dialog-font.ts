/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import type { FontView } from './dialog.type';

const wasmGetDialogFont = (which: 0 | 1): FontView | null =>
  callPtr('WasmGetDialogFont', (mod, ptr) => {
    const size = mod.ccall('WasmGetDialogFontSize', 'number', ['number'], [which]) as number;
    return size > 0 ? { heap: mod.HEAPU8, ptr, size } : null;
  }, { argTypes: ['number'], args: [which] });

export { wasmGetDialogFont };
