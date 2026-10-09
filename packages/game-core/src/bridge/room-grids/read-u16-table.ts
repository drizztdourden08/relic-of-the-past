/* @layer bridge-wasm @kind logic */
import { readU16 } from '../wasm-call';

const readU16Table = (heap: Uint8Array, ptr: number, length: number): number[] =>
  Array.from({ length }, (_, i) => readU16(heap, ptr + i * 2));

export { readU16Table };
