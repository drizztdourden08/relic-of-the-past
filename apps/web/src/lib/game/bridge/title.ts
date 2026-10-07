/* @layer bridge-wasm @kind logic */
/** The title mirror and the native title hide (core/game-hooks/title_mirror.c, title_override.c). */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import { callPtr, numberCall, readU16, voidCall } from './wasm-call';

const POLY_BYTES = 0x800;
const PALETTE_COLOURS = 8;

const readI16 = (heap: Uint8Array, o: number): number => (readU16(heap, o) << 16) >> 16;

/** The struct laid out in title_mirror.c, field by field. */
const decodeTitleFrame = (heap: Uint8Array, p: number): TitleFrame => ({
  module: heap[p], submodule: heap[p + 1], subsub: heap[p + 2],
  step: heap[p + 3], stepTimer: heap[p + 4], frameCtr: heap[p + 5],
  inidisp: heap[p + 6],
  polyA: heap[p + 7], polyB: heap[p + 8], polyDistance: heap[p + 9],
  swordY: readI16(heap, p + 10),
  sparklePhase: heap[p + 12], sparkleIndex: heap[p + 13], sparkleRun: heap[p + 14],
  flashLeft: heap[p + 15], fade: heap[p + 16],
  // int16 piece_x[3] is aligned to the next even byte after the fade.
  pieces: [0, 1, 2].map((k) => ({ x: readI16(heap, p + 18 + k * 2), y: readI16(heap, p + 24 + k * 2) })),
  attractState: heap[p + 30],
});

/** The intro's clock this frame, or null when the game is not running or the gate is closed. */
const wasmGetTitleFrame = (): TitleFrame | null => callPtr('WasmGetTitleFrame', (mod, ptr) => decodeTitleFrame(mod.HEAPU8, ptr));

/** A view over the poly thread's 4bpp tile block; taken every frame because the heap can grow. */
const wasmGetTitlePoly = (): Uint8Array | null =>
  callPtr('WasmGetTitlePoly', (mod, ptr) => mod.HEAPU8.subarray(ptr, ptr + POLY_BYTES));

/** The eight SNES colour words the triangles draw with. */
const wasmGetTitlePalette = (): number[] | null =>
  callPtr('WasmGetTitlePalette', (mod, ptr) => Array.from({ length: PALETTE_COLOURS }, (_, i) => readU16(mod.HEAPU8, ptr + i * 2)));

/** Ask for the native title to be kept off the picture while the host draws its own. */
const wasmSetTitleHidden = (hidden: boolean): void =>
  voidCall('WasmSetTitleHidden', { argTypes: ['number'], args: [hidden ? 1 : 0] });

/** Whether the hide is in force this frame: the gate open, the request made and the title on screen. */
const wasmGetTitleHidden = (): boolean => numberCall('WasmGetTitleHidden', 0) !== 0;

export { wasmGetTitleFrame, wasmGetTitleHidden, wasmGetTitlePalette, wasmGetTitlePoly, wasmSetTitleHidden };
