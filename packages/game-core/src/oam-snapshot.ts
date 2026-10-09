/* @layer bridge-wasm @kind logic */
import type { OamSnapshot, OamSlot, SpriteSlot } from './oam-snapshot.type';
import { getModule, getGameState } from './wasm-bridge';
import {
  HEADER,
  STRIDE,
  OAM_SLOTS,
  SPRITE_SLOTS,
  SPRITE_STRIDE,
  HIDDEN_Y,
  NO_SHADOW_OAM_POS,
  Y_HIGH_NINTH_BIT_SET,
} from './oam-snapshot.constants';
import { readU8 } from "./bridge/wasm-call";

const s16 = (v: number): number => (v >= 0x8000 ? v - 0x10000 : v);
const s8 = (v: number): number => (v >= 0x80 ? v - 0x100 : v);

const readSlots = (heap: Uint8Array, ptr: number, u16: (at: number) => number): OamSlot[] => {
  const count = u16(0);
  const slots: OamSlot[] = [];
  for (let i = 0; i < count; i++) {
    const at = ptr + HEADER + i * STRIDE;
    const xLow = readU8(heap, at + 0);
    const y = readU8(heap, at + 1);
    const ext = readU8(heap, at + 4);
    const xHigh = s8(readU8(heap, at + 5));
    slots.push({
      slot: i,
      xLow,
      y,
      charnum: readU8(heap, at + 2),
      flags: readU8(heap, at + 3),
      ext,
      xHigh,
      yHigh: readU8(heap, at + 6),
      isPlayer: heap[at + 7] === 1,
      resolvedX: xLow + (ext & 1) * 256 + xHigh * 512,
      resolvedY: (() => {
        const tall = u16(40);
        const marker = readU8(heap, at + 6);
        if (!tall || marker === 0) return y;
        let yy = y + (marker === Y_HIGH_NINTH_BIT_SET ? 256 : 0);
        if (yy >= 256 + tall) yy -= 512;
        return yy + s16(u16(42));
      })(),
      hidden: y === HIDDEN_Y,
    });
  }
  return slots;
};

const readSprites = (heap: Uint8Array, ptr: number): SpriteSlot[] =>
  Array.from({ length: SPRITE_SLOTS }, (_v, i) => {
    const at = ptr + HEADER + OAM_SLOTS * STRIDE + i * SPRITE_STRIDE;
    return {
      slot: i,
      state: readU8(heap, at + 0),
      pause: readU8(heap, at + 1),
      inBand: heap[at + 2] === 1,
      type: readU8(heap, at + 3),
      screenX: s16((heap[at + 4] ?? 0) | ((heap[at + 5] ?? 0) << 8)),
      screenY: s16((heap[at + 6] ?? 0) | ((heap[at + 7] ?? 0) << 8)),
    };
  });

const readOamSnapshot = (): OamSnapshot | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  const ptr = mod.ccall('WasmGetOamSnapshot', 'number', [], []) as number;
  const developerToolsOn = ptr !== 0;
  if (!developerToolsOn) return null;

  const heap = mod.HEAPU8;
  const u16 = (at: number): number => (heap[ptr + at] ?? 0) | ((heap[ptr + at + 1] ?? 0) << 8);
  const slots = readSlots(heap, ptr, u16);

  return {
    playerBase: u16(2),
    playerScreenX: s16(u16(4)),
    playerScreenY: s16(u16(6)),
    wideBudget: u16(8),
    tallBudget: u16(10),
    cameraLockShiftX: s16(u16(12)),
    visibilityStatus: readU8(heap, ptr + 14),
    blinkCountdown: readU8(heap, ptr + 15),
    hide: {
      ran: ((heap[ptr + 16] ?? 0) & 1) !== 0,
      offscreenYBranch: ((heap[ptr + 16] ?? 0) & 2) !== 0,
      stockExtBranch: ((heap[ptr + 16] ?? 0) & 4) !== 0,
      submodule: readU8(heap, ptr + 17),
      blinkAsSeen: readU8(heap, ptr + 18),
      inDoorway: heap[ptr + 19] === 1,
      capeMode: readU8(heap, ptr + 20),
      shadowOamPos: heap[ptr + 21] === NO_SHADOW_OAM_POS ? null : s8(readU8(heap, ptr + 21)),
    },
    mainModule: readU8(heap, ptr + 22),
    submodule: readU8(heap, ptr + 23),
    overworldMapState: readU8(heap, ptr + 24),
    savedModuleForMenu: readU8(heap, ptr + 25),
    renderExtraLeft: s16(u16(28)),
    renderExtraRight: s16(u16(30)),
    bandLoX: s16(u16(32)),
    bandHiX: s16(u16(34)),
    renderExtraTop: s16(u16(36)),
    renderExtraBottom: s16(u16(38)),
    tallBudgetConfigured: u16(40),
    cameraLockShiftY: s16(u16(42)),
    slots,
    sprites: readSprites(heap, ptr),
  };
};

export { readOamSnapshot };
export type { OamSnapshot, OamSlot, SpriteSlot } from './oam-snapshot.type';
