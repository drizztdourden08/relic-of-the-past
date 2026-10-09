/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetArrows = (count: number): void => voidCall('WasmCheatSetArrows', numArgs(count));

export { cheatSetArrows };
