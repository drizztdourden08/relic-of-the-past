/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSetTitleHidden = (hidden: boolean): void =>
  voidCall('WasmSetTitleHidden', { argTypes: ['number'], args: [hidden ? 1 : 0] });

export { wasmSetTitleHidden };
