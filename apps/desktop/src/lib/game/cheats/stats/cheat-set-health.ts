/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetHealth = (value: number): void => voidCall('WasmCheatSetHealth', numArgs(value));

export { cheatSetHealth };
