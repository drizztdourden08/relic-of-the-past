/* @layer bridge-wasm @kind logic */
import { numberCall, voidCall } from './wasm-call';

const boolArg = (b: boolean): { argTypes: string[]; args: unknown[] } => ({ argTypes: ['number'], args: [b ? 1 : 0] });

const wasmSetPaused = (paused: boolean): void => voidCall('WasmSetPaused', boolArg(paused));

const wasmStepFrames = (frames: number): void => voidCall('WasmStepFrames', { argTypes: ['number'], args: [frames] });

const wasmGetPendingSteps = (): number => numberCall('WasmGetPendingSteps', 0);

export { wasmGetPendingSteps, wasmSetPaused, wasmStepFrames };
