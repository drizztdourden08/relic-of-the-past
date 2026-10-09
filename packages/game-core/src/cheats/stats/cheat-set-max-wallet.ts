/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetMaxWallet = (wantedCapacity: number): void => voidCall('WasmCheatSetMaxWallet', numArgs(wantedCapacity));

export { cheatSetMaxWallet };
