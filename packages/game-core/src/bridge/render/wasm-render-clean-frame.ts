/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';
import { RGBA_BYTES } from './render.constants';
import type { CleanFrame } from './render.type';

const wasmRenderCleanFrame = (): CleanFrame | null =>
  callWhenRunning<CleanFrame | null>(null, (mod) => {
    const ptr = mod.ccall('WasmRenderCleanFrame', 'number', [], []);
    if (!ptr) return null;
    const width = mod.ccall('WasmGetCleanFrameWidth', 'number', [], []);
    const height = mod.ccall('WasmGetCleanFrameHeight', 'number', [], []);
    if (!width || !height) return null;
    const byteLength = width * height * RGBA_BYTES;
    const data = mod.HEAPU8.subarray(ptr, ptr + byteLength);
    return { data, width, height };
  });

export { wasmRenderCleanFrame };
