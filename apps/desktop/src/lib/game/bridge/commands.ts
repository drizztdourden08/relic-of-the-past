/* @layer bridge-wasm @kind logic */
/** Game commands — pause. */
import { voidCall } from './wasm-call';

const boolArg = (b: boolean): { argTypes: string[]; args: unknown[] } => ({ argTypes: ['number'], args: [b ? 1 : 0] });

/** Pause or unpause the game at the WASM/C level. */
const wasmSetPaused = (paused: boolean): void => voidCall('WasmSetPaused', boolArg(paused));

export { wasmSetPaused };
