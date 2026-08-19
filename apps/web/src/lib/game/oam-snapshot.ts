/* @layer bridge-wasm @kind logic */
/**
 * Reader for the OAM snapshot query. Returns the sprite table as the PPU will read it, including the
 * wide/tall side channels that hold the coordinate bits the stock 9-bit X and 8-bit Y cannot. A sprite
 * whose game-side position is right can still reach the PPU wrong when those disagree, which a
 * screenshot cannot distinguish; this read can.
 *
 * Needs the developer-tools setting on, matching the C gate. Returns null when it is off.
 */
import { getModule, getGameState } from './wasm-bridge';

const HEADER = 44;
const STRIDE = 8;

interface OamSlot {
  slot: number;
  xLow: number;
  y: number;
  charnum: number;
  flags: number;
  ext: number;
  xHigh: number; // signed: X bits above the 9th
  /** Tall Y marker: 0 = not tall-encoded, 1 = 9th bit clear, 2 = 9th bit set. */
  yHigh: number;
  isPlayer: boolean;
  /** The X the PPU resolves: low byte + ext bit 8 + signed xHigh pages. */
  resolvedX: number;
  /** Y the PPU resolves in tall mode: 9-bit value, folded, then shifted. */
  resolvedY: number;
  hidden: boolean;
}

interface OamSnapshot {
  playerBase: number;
  playerScreenX: number;
  playerScreenY: number;
  wideBudget: number;
  tallBudget: number;
  cameraLockShiftX: number;
  visibilityStatus: number;
  blinkCountdown: number;
  /** Which terms of the player-hide condition were true, and which branch ran. */
  hide: {
    ran: boolean;
    offscreenYBranch: boolean;
    stockExtBranch: boolean;
    submodule: number;
    blinkAsSeen: number;
    inDoorway: boolean;
    capeMode: number;
    shadowOamPos: number | null;
  };
  slots: OamSlot[];
  mainModule: number;
  submodule: number;
  overworldMapState: number;
  savedModuleForMenu: number;
  renderExtraLeft: number;
  renderExtraRight: number;
  bandLoX: number;
  bandHiX: number;
  renderExtraTop: number;
  renderExtraBottom: number;
  tallBudgetConfigured: number;
  cameraLockShiftY: number;
  /** Per-sprite-slot AI gating state, 16 entries. */
  sprites: SpriteSlot[];
}

interface SpriteSlot {
  slot: number;
  state: number;
  pause: number;
  inBand: boolean;
  type: number;
  screenX: number;
  screenY: number;
}

const s16 = (v: number): number => (v >= 0x8000 ? v - 0x10000 : v);
const s8 = (v: number): number => (v >= 0x80 ? v - 0x100 : v);

const readOamSnapshot = (): OamSnapshot | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  const ptr = mod.ccall('WasmGetOamSnapshot', 'number', [], []) as number;
  if (!ptr) return null; // developer tools off

  const heap = mod.HEAPU8;
  const u16 = (at: number): number => heap[ptr + at] | (heap[ptr + at + 1] << 8);
  const count = u16(0);
  const slots: OamSlot[] = [];

  for (let i = 0; i < count; i++) {
    const at = ptr + HEADER + i * STRIDE;
    const xLow = heap[at + 0];
    const y = heap[at + 1];
    const ext = heap[at + 4];
    const xHigh = s8(heap[at + 5]);
    slots.push({
      slot: i,
      xLow,
      y,
      charnum: heap[at + 2],
      flags: heap[at + 3],
      ext,
      xHigh,
      yHigh: heap[at + 6],
      isPlayer: heap[at + 7] === 1,
      resolvedX: xLow + (ext & 1) * 256 + xHigh * 512,
      resolvedY: (() => {
        const tall = u16(40);
        const marker = heap[at + 6];
        if (!tall || marker === 0) return y;
        let yy = y + (marker === 2 ? 256 : 0);
        if (yy >= 256 + tall) yy -= 512;
        return yy + s16(u16(42));
      })(),
      hidden: y === 0xf0,
    });
  }

  return {
    playerBase: u16(2),
    playerScreenX: s16(u16(4)),
    playerScreenY: s16(u16(6)),
    wideBudget: u16(8),
    tallBudget: u16(10),
    cameraLockShiftX: s16(u16(12)),
    visibilityStatus: heap[ptr + 14],
    blinkCountdown: heap[ptr + 15],
    hide: {
      ran: (heap[ptr + 16] & 1) !== 0,
      offscreenYBranch: (heap[ptr + 16] & 2) !== 0,
      stockExtBranch: (heap[ptr + 16] & 4) !== 0,
      submodule: heap[ptr + 17],
      blinkAsSeen: heap[ptr + 18],
      inDoorway: heap[ptr + 19] === 1,
      capeMode: heap[ptr + 20],
      shadowOamPos: heap[ptr + 21] === 0xff ? null : s8(heap[ptr + 21]),
    },
    mainModule: heap[ptr + 22],
    submodule: heap[ptr + 23],
    overworldMapState: heap[ptr + 24],
    savedModuleForMenu: heap[ptr + 25],
    renderExtraLeft: s16(u16(28)),
    renderExtraRight: s16(u16(30)),
    bandLoX: s16(u16(32)),
    bandHiX: s16(u16(34)),
    renderExtraTop: s16(u16(36)),
    renderExtraBottom: s16(u16(38)),
    tallBudgetConfigured: u16(40),
    cameraLockShiftY: s16(u16(42)),
    slots,
    sprites: Array.from({ length: 16 }, (_v, i) => {
      const at = ptr + HEADER + 128 * STRIDE + i * 8;
      return {
        slot: i,
        state: heap[at + 0],
        pause: heap[at + 1],
        inBand: heap[at + 2] === 1,
        type: heap[at + 3],
        screenX: s16(heap[at + 4] | (heap[at + 5] << 8)),
        screenY: s16(heap[at + 6] | (heap[at + 7] << 8)),
      };
    }),
  };
};

export { readOamSnapshot };
export type { OamSnapshot, OamSlot, SpriteSlot };
