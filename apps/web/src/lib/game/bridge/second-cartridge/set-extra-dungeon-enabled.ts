/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const setExtraDungeonEnabled = (on: boolean): void =>
  voidCall('WasmSetExtraDungeonEnabled', { argTypes: ['number'], args: [on ? 1 : 0] });

export { setExtraDungeonEnabled };
