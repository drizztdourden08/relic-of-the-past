/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSetDialogPacing = (baseQ4: number, holdQ4: number, holdOn: boolean, fillOn: boolean): void =>
  voidCall('WasmSetDialogPacing', {
    argTypes: ['number', 'number', 'number', 'number'],
    args: [baseQ4, holdQ4, holdOn ? 1 : 0, fillOn ? 1 : 0],
  });

export { wasmSetDialogPacing };
