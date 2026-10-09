/* @layer bridge-wasm @kind logic */
import { voidCall } from './wasm-call';

const restoreCoreMusic = (): void =>
  voidCall('WasmRestoreMusic', { argTypes: [], args: [] });

export { restoreCoreMusic };
