/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetBombs = (count: number): void => voidCall('WasmCheatSetBombs', numArgs(count));

export { cheatSetBombs };
