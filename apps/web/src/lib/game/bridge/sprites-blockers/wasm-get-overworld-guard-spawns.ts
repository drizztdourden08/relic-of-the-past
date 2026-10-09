/* @layer bridge-wasm @kind logic */
import { decodeTable } from '../wasm-call';
import { decodePoint } from './decode-point';
import type { Point } from './sprites-blockers.type';

const wasmGetOverworldGuardSpawns = (): Point[] =>
  decodeTable('WasmGetOverworldGuardSpawns', { countBytes: 1, dataStart: 1, stride: 4, maxCount: 16 }, decodePoint);

export { wasmGetOverworldGuardSpawns };
