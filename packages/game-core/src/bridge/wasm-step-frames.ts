/* @layer bridge-wasm @kind logic */
import { voidCall } from './wasm-call';

const wasmStepFrames = (frames: number): void => voidCall('WasmStepFrames', { argTypes: ['number'], args: [frames] });

export { wasmStepFrames };
