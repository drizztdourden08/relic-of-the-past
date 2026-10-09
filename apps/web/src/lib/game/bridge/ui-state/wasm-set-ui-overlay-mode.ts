/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSetUIOverlayMode = (mode: number): void =>
  voidCall('WasmSetUIOverlayMode', { argTypes: ['number'], args: [mode] });

export { wasmSetUIOverlayMode };
