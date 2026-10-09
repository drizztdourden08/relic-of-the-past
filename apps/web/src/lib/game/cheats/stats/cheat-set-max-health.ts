/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetMaxHealth = (value: number): void => voidCall('WasmCheatSetMaxHealth', numArgs(value));

export { cheatSetMaxHealth };
