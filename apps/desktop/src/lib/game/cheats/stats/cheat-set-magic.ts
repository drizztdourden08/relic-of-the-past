/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetMagic = (value: number): void => voidCall('WasmCheatSetMagic', numArgs(value));

export { cheatSetMagic };
