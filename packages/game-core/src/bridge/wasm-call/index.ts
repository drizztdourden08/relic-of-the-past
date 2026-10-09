/* @layer bridge-wasm @kind barrel */
export { readU8 } from './read-u8';
export { readU16 } from './read-u16';
export { callWhenRunning } from './call-when-running';
export { decodeCountPrefixed } from './decode-count-prefixed';
export { decodeTable } from './decode-table';
export { decodeGatedTable } from './decode-gated-table';
export { callPtr } from './call-ptr';
export { numberCall } from './number-call';
export { voidCall } from './void-call';
export type { TableLayout, CallArgs } from './wasm-call.type';
