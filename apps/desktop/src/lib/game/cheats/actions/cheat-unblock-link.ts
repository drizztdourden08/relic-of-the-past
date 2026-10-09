/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';

const cheatUnblockLink = (): void => voidCall('WasmCheatUnblockLink');

export { cheatUnblockLink };
