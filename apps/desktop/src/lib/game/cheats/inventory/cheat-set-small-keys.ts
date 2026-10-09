/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetSmallKeys = (count: number): void => voidCall('WasmCheatSetSmallKeys', numArgs(count));

export { cheatSetSmallKeys };
