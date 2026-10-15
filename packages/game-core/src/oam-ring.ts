/* @layer bridge-wasm @kind logic */
import type { RingFrame, RingSlot } from './oam-ring.type';
import { getModule, getGameState } from './wasm-bridge';
import { HEAD, SLOTS, SLOT_BYTES, HIDDEN_Y, Y_HIGH_NINTH_BIT_SET } from './oam-ring.constants';
import { readU8 } from "./bridge/wasm-call";

const s16 = (v: number): number => (v >= 0x8000 ? v - 0x10000 : v);

const u16At = (heap: Uint8Array, at: number): number => (heap[at] ?? 0) | ((heap[at + 1] ?? 0) << 8);

const resolvedYOf = (y: number, yHigh: number, tallBudget: number, shiftY: number): number => {
  if (!tallBudget || yHigh === 0) return y;
  const raised = y + (yHigh === Y_HIGH_NINTH_BIT_SET ? 256 : 0);
  return (raised >= 256 + tallBudget ? raised - 512 : raised) + shiftY;
};

const readRingSlot = (heap: Uint8Array, p: number, i: number): RingSlot => {
  const slotAt = p + HEAD + i * SLOT_BYTES;
  const tallBudget = u16At(heap, p + 6);
  const shiftY = s16(u16At(heap, p + 4));
  const y = readU8(heap, slotAt);
  const yHigh = readU8(heap, slotAt + 1);
  const x = readU8(heap, slotAt + 4);
  const ext = readU8(heap, slotAt + 5);
  const x9 = x + (ext & 1) * 256;
  return {
    slot: i,
    y,
    yHigh,
    charnum: readU8(heap, slotAt + 2),
    resolvedY: resolvedYOf(y, yHigh, tallBudget, shiftY),
    hidden: y === HIDDEN_Y,
    drawn: heap[slotAt + 3] === 1,
    x,
    ext,
    resolvedX: x9 >= 256 ? x9 - 512 : x9,
  };
};

const readRingFrame = (heap: Uint8Array, p: number, index: number): RingFrame => {
  const u16 = (at: number): number => u16At(heap, p + at);
  return {
    index,
    frame: u16(0),
    playerScreenY: s16(u16(2)),
    cameraLockShiftY: s16(u16(4)),
    tallBudget: u16(6),
    renderExtraTop: s16(u16(8)),
    renderExtraBottom: s16(u16(10)),
    playerScreenX: s16(u16(12)),
    cameraLockShiftX: s16(u16(14)),
    spriteBudgetHits: u16(16),
    tileBudgetHits: u16(18),
    slots: Array.from({ length: SLOTS }, (_slot, i) => readRingSlot(heap, p, i)),
  };
};

const ringPointers = (): { heap: Uint8Array; headPtr: number; base: number } | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  const headPtr = mod.ccall('WasmGetOamRing', 'number', [], []);
  const developerToolsOn = headPtr !== 0;
  if (!developerToolsOn) return null;
  const base = mod.ccall('WasmGetOamRingBuffer', 'number', [], []);
  if (!base) return null;
  return { heap: mod.HEAPU8, headPtr, base };
};

const readOamRing = (): RingFrame[] | null => {
  const pointers = ringPointers();
  if (!pointers) return null;
  const { heap, headPtr, base } = pointers;
  const written = u16At(heap, headPtr) | (u16At(heap, headPtr + 2) << 16);
  const capacity = u16At(heap, headPtr + 4);
  const stride = u16At(heap, headPtr + 6);
  if (!capacity || !stride) return null;

  const count = Math.min(written, capacity);
  const first = written - count;
  return Array.from({ length: count }, (_frame, n) =>
    readRingFrame(heap, base + ((first + n) % capacity) * stride, first + n));
};

export { readOamRing };
