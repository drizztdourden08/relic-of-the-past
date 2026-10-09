/* @layer bridge-wasm @kind logic */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import { readI16 } from './read-i16';
import { PIECE_X_OFFSET, PIECE_Y_OFFSET, TRIFORCE_PIECES } from './title.constants';

const decodeTitleFrame = (heap: Uint8Array, p: number): TitleFrame => ({
  module: heap[p], submodule: heap[p + 1], subsub: heap[p + 2],
  step: heap[p + 3], stepTimer: heap[p + 4], frameCtr: heap[p + 5],
  inidisp: heap[p + 6],
  polyA: heap[p + 7], polyB: heap[p + 8], polyDistance: heap[p + 9],
  swordY: readI16(heap, p + 10),
  sparklePhase: heap[p + 12], sparkleIndex: heap[p + 13], sparkleRun: heap[p + 14],
  flashLeft: heap[p + 15], fade: heap[p + 16],
  pieces: TRIFORCE_PIECES.map((k) => ({ x: readI16(heap, p + PIECE_X_OFFSET + k * 2), y: readI16(heap, p + PIECE_Y_OFFSET + k * 2) })),
  attractState: heap[p + 30],
});

export { decodeTitleFrame };
