/* @layer bridge-wasm @kind logic */
/**
 * Reader for the per-frame OAM ring.
 *
 * The core captures each frame once, after its OAM is complete, into a ring buffer. Reading `oam_buf`
 * live instead is unsound: the game clears every entry at the top of its loop and draws sprites after,
 * so a read landing mid-loop reports entries that were never actually missing from a rendered frame.
 * Draining the ring gives every game frame in order, with no sampling race.
 *
 * Needs the developer-tools setting on, matching the C gate. Returns null when it is off.
 */
import { getModule, getGameState } from './wasm-bridge';

const HEAD = 20;
const SLOTS = 128;

interface RingSlot {
  slot: number;
  y: number;
  /** Tall Y marker: 0 = not tall-encoded, 1 = 9th bit clear, 2 = 9th bit set. */
  yHigh: number;
  charnum: number;
  /** Y the PPU resolves: 9-bit value, folded, then shifted. */
  resolvedY: number;
  hidden: boolean;
  /** True when this slot actually wrote pixels during this frame's rasterisation. */
  drawn: boolean;
  x: number;
  ext: number;
  /** X the PPU resolves in a tall-only view: 9-bit value folded at 256. */
  resolvedX: number;
}

interface RingFrame {
  /** Absolute capture index. The game's own frame counter is 8-bit and wraps, so this is the identity a
   *  caller draining repeatedly must key on to stitch overlapping reads together. */
  index: number;
  frame: number;
  playerScreenY: number;
  playerScreenX: number;
  cameraLockShiftY: number;
  cameraLockShiftX: number;
  tallBudget: number;
  renderExtraTop: number;
  renderExtraBottom: number;
  /** How often the per-line sprite / tile budgets cut evaluation short this frame. */
  spriteBudgetHits: number;
  tileBudgetHits: number;
  slots: RingSlot[];
}

const s16 = (v: number): number => (v >= 0x8000 ? v - 0x10000 : v);

/** Drains the ring in capture order, oldest first. Frames are consecutive game frames. */
const readOamRing = (): RingFrame[] | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  const headPtr = mod.ccall('WasmGetOamRing', 'number', [], []) as number;
  if (!headPtr) return null; // developer tools off
  const base = mod.ccall('WasmGetOamRingBuffer', 'number', [], []) as number;
  if (!base) return null;

  const heap = mod.HEAPU8;
  const written =
    heap[headPtr] | (heap[headPtr + 1] << 8) | (heap[headPtr + 2] << 16) | (heap[headPtr + 3] << 24);
  const capacity = heap[headPtr + 4] | (heap[headPtr + 5] << 8);
  const stride = heap[headPtr + 6] | (heap[headPtr + 7] << 8);
  if (!capacity || !stride) return null;

  const count = Math.min(written, capacity);
  const first = written - count;
  const out: RingFrame[] = [];

  for (let n = 0; n < count; n++) {
    const p = base + ((first + n) % capacity) * stride;
    const u16 = (at: number): number => heap[p + at] | (heap[p + at + 1] << 8);
    const tallBudget = u16(6);
    const shiftY = s16(u16(4));
    const slots: RingSlot[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const y = heap[p + HEAD + i * 6];
      const yHigh = heap[p + HEAD + i * 6 + 1];
      const x = heap[p + HEAD + i * 6 + 4];
      const ext = heap[p + HEAD + i * 6 + 5];
      const x9 = x + (ext & 1) * 256;
      let resolved = y;
      if (tallBudget && yHigh !== 0) {
        resolved = y + (yHigh === 2 ? 256 : 0);
        if (resolved >= 256 + tallBudget) resolved -= 512;
        resolved += shiftY;
      }
      slots.push({
        slot: i,
        y,
        yHigh,
        charnum: heap[p + HEAD + i * 6 + 2],
        resolvedY: resolved,
        hidden: y === 0xf0,
        drawn: heap[p + HEAD + i * 6 + 3] === 1,
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
export type { RingFrame, RingSlot };
