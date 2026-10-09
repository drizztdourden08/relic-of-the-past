/* @layer bridge-wasm @kind logic */
import { voidCall } from './wasm-call';

const boolArg = (b: boolean): { argTypes: string[]; args: unknown[] } => ({ argTypes: ['number'], args: [b ? 1 : 0] });

const wasmSetPaused = (paused: boolean): void => voidCall('WasmSetPaused', boolArg(paused));

export { wasmSetPaused };
