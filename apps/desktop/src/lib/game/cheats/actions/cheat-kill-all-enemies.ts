/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';

const cheatKillAllEnemies = (): void => voidCall('WasmCheatKillAllEnemies');

export { cheatKillAllEnemies };
