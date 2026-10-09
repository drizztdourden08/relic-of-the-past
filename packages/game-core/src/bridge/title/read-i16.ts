/* @layer bridge-wasm @kind logic */
import { readU16 } from '../wasm-call';

const readI16 = (heap: Uint8Array, o: number): number => (readU16(heap, o) << 16) >> 16;

export { readI16 };
