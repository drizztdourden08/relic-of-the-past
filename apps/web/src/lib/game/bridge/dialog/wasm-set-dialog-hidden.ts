/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSetDialogHidden = (hidden: boolean): void =>
  voidCall('WasmSetDialogHidden', { argTypes: ['number'], args: [hidden ? 1 : 0] });

export { wasmSetDialogHidden };
