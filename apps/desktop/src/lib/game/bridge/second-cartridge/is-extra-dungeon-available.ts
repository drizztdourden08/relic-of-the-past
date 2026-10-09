/* @layer bridge-wasm @kind logic */
import { numberCall } from '../wasm-call';

const isExtraDungeonAvailable = (): boolean =>
  numberCall('WasmGetExtraDungeonAvailable', 0, { argTypes: [], args: [] }) === 1;

export { isExtraDungeonAvailable };
