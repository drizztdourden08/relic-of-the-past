/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetRupees = (amount: number): void => voidCall('WasmCheatSetRupees', numArgs(amount));

export { cheatSetRupees };
