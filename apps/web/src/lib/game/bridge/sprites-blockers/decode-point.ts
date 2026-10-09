/* @layer bridge-wasm @kind logic */
import { readU16 } from '../wasm-call';
import type { Point } from './sprites-blockers.type';

const decodePoint = (heap: Uint8Array, o: number): Point => ({ x: readU16(heap, o), y: readU16(heap, o + 2) });

export { decodePoint };
