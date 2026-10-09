/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetMaxArrows = (wantedCapacity: number): void => voidCall('WasmCheatSetMaxArrows', numArgs(wantedCapacity));

export { cheatSetMaxArrows };
