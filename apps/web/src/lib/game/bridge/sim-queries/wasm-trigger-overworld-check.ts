/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmTriggerOverworldCheck = (screen: number, mask: number, itemId: number): void =>
  voidCall('WasmTriggerOverworldCheck', { argTypes: ['number', 'number', 'number'], args: [screen, mask, itemId] });

export { wasmTriggerOverworldCheck };
