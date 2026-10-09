/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';

const cheatRefillMagic = (): void => voidCall('WasmCheatRefillMagic');

export { cheatRefillMagic };
