/* @layer bridge-wasm @kind logic */
import type { RingFrame, RingSlot } from './oam-ring.type';
import { getModule, getGameState } from './wasm-bridge';
import { HEAD, SLOTS, SLOT_BYTES, HIDDEN_Y, Y_HIGH_NINTH_BIT_SET } from './oam-ring.constants';
import { readU8 } from "./bridge/wasm-call";

const s16 = (v: number): number => (v >= 0x8000 ? v - 0x10000 : v);

const readOamRing = (): RingFrame[] | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  const headPtr = mod.ccall('WasmGetOamRing', 'number', [], []) as number;
  const developerToolsOn = headPtr !== 0;
  if (!developerToolsOn) return null;
  const base = mod.ccall('WasmGetOamRingBuffer', 'number', [], []) as number;
  if (!base) return null;

  const heap = mod.HEAPU8;
  const written =
    (heap[headPtr] ?? 0) | ((heap[headPtr + 1] ?? 0) << 8) | ((heap[headPtr + 2] ?? 0) << 16) | ((heap[headPtr + 3] ?? 0) << 24);
  const capacity = (heap[headPtr + 4] ?? 0) | ((heap[headPtr + 5] ?? 0) << 8);
  const stride = (heap[headPtr + 6] ?? 0) | ((heap[headPtr + 7] ?? 0) << 8);
  if (!capacity || !stride) return null;

  const count = Math.min(written, capacity);
  const first = written - count;
  const out: RingFrame[] = [];

  for (let n = 0; n < count; n++) {
    const p = base + ((first + n) % capacity) * stride;
    const u16 = (at: number): number => (heap[p + at] ?? 0) | ((heap[p + at + 1] ?? 0) << 8);
    const tallBudget = u16(6);
    const shiftY = s16(u16(4));
    const slots: RingSlot[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const slotAt = p + HEAD + i * SLOT_BYTES;
      const y = readU8(heap, slotAt);
      const yHigh = readU8(heap, slotAt + 1);
      const x = readU8(heap, slotAt + 4);
      const ext = readU8(heap, slotAt + 5);
      const x9 = x + (ext & 1) * 256;
      let resolved = y;
      if (tallBudget && yHigh !== 0) {
        resolved = y + (yHigh === Y_HIGH_NINTH_BIT_SET ? 256 : 0);
        if (resolved >= 256 + tallBudget) resolved -= 512;
        resolved += shiftY;
      }
      slots.push({
        slot: i,
        y,
        yHigh,
        charnum: readU8(heap, slotAt + 2),
        resolvedY: resolved,
        hidden: y === HIDDEN_Y,
        drawn: heap[slotAt + 3] === 1,
        x,
        ext,
        resolvedX: x9 >= 256 ? x9 - 512 : x9,
      });
    }
    out.push({
      index: first + n,
      frame: u16(0),
      playerScreenY: s16(u16(2)),
      cameraLockShiftY: shiftY,
      tallBudget,
      renderExtraTop: s16(u16(8)),
      renderExtraBottom: s16(u16(10)),
      playerScreenX: s16(u16(12)),
      cameraLockShiftX: s16(u16(14)),
      spriteBudgetHits: u16(16),
      tileBudgetHits: u16(18),
      slots,
    });
  }
  return out;
};

export { readOamRing };
export type { RingFrame, RingSlot } from './oam-ring.type';
