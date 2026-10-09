/* @layer bridge-wasm @kind logic */
import type { TitleFrame } from '@rotp/game-data';
import { readI16 } from './read-i16';
import { PIECE_X_OFFSET, PIECE_Y_OFFSET, TRIFORCE_PIECES } from './title.constants';
import { readU8 } from "../wasm-call";

const decodeTitleFrame = (heap: Uint8Array, p: number): TitleFrame => ({
  module: readU8(heap, p), submodule: readU8(heap, p + 1), subsub: readU8(heap, p + 2),
  step: readU8(heap, p + 3), stepTimer: readU8(heap, p + 4), frameCtr: readU8(heap, p + 5),
  inidisp: readU8(heap, p + 6),
  polyA: readU8(heap, p + 7), polyB: readU8(heap, p + 8), polyDistance: readU8(heap, p + 9),
  swordY: readI16(heap, p + 10),
  sparklePhase: readU8(heap, p + 12), sparkleIndex: readU8(heap, p + 13), sparkleRun: readU8(heap, p + 14),
  flashLeft: readU8(heap, p + 15), fade: readU8(heap, p + 16),
  pieces: TRIFORCE_PIECES.map((k) => ({ x: readI16(heap, p + PIECE_X_OFFSET + k * 2), y: readI16(heap, p + PIECE_Y_OFFSET + k * 2) })),
  attractState: readU8(heap, p + 30),
});

export { decodeTitleFrame };
