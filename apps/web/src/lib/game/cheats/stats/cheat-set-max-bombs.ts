/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetMaxBombs = (wantedCapacity: number): void => voidCall('WasmCheatSetMaxBombs', numArgs(wantedCapacity));

export { cheatSetMaxBombs };
