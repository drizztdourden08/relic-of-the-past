/**
 * Event overlay patches — derived from Overworld_LoadEventOverlay() in overworld.c.
 *
 * When save_ow_event_info[screen] & 0x20 is set, these Map16 tile patches
 * are applied to the screen's tilemap buffer. The game uses a 64-wide stride
 * buffer (XY(x,y) = y*64+x). Our flood fill uses 32×32 Map16 buffers.
 *
 * Patches with col >= 32 or row >= 32 target the right/bottom quadrants of
 * big screens. We map them to the correct screen index using quadrant offsets.
 */

export interface TilePatch {
  col: number;  // Map16 column (0-31 for the target screen)
  row: number;  // Map16 row (0-31 for the target screen)
  tile: number; // Map16 tile ID to write
}

/**
 * Map from screen index → patches to apply when that screen's event overlay is active.
 * Only includes patches that fall within the 32×32 Map16 grid of the keyed screen.
 *
 * For big screens, patches in the right half (col 32-63) are assigned to screenIdx+1,
 * bottom half (row 32-63) to screenIdx+8, bottom-right to screenIdx+9.
 */
const EVENT_OVERLAY_PATCHES: Record<number, TilePatch[]> = {};

// Helper to register patches for a set of screens
function reg(screens: number[], patches: TilePatch[]): void {
  for (const s of screens) {
    EVENT_OVERLAY_PATCHES[s] = (EVENT_OVERLAY_PATCHES[s] ?? []).concat(patches);
  }
}

// ─── From Overworld_LoadEventOverlay() switch cases ─────────────────────────

// case 0, 1, 2: Master Sword grove (big screen area heads → top-left quadrant)
reg([0, 1, 2], [
  { col: 11, row: 16, tile: 0xe32 }, { col: 12, row: 16, tile: 0xe32 },
  { col: 13, row: 16, tile: 0xe32 }, { col: 14, row: 16, tile: 0xe32 },
  { col: 11, row: 17, tile: 0xe32 }, { col: 14, row: 17, tile: 0xe32 },
  { col: 12, row: 17, tile: 0xe33 }, { col: 13, row: 17, tile: 0xe34 },
  { col: 11, row: 18, tile: 0xe35 }, { col: 12, row: 18, tile: 0xe36 },
  { col: 13, row: 18, tile: 0xe37 }, { col: 14, row: 18, tile: 0xe38 },
  { col: 11, row: 19, tile: 0xe39 }, { col: 12, row: 19, tile: 0xe3a },
  { col: 13, row: 19, tile: 0xe3b }, { col: 14, row: 19, tile: 0xe3c },
  { col: 12, row: 20, tile: 0xe3d }, { col: 13, row: 20, tile: 0xe3e },
]);

// case 3-7: single tile change (small screens)
reg([3, 4, 5, 6, 7], [
  { col: 16, row: 14, tile: 0x212 },
]);

// case 8-19: loc_8EF7B4 pattern at XY(3, 10) — 2×2 patch
reg([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], [
  { col: 3, row: 10, tile: 0x918 }, { col: 4, row: 10, tile: 0x919 },
  { col: 3, row: 11, tile: 0x91a }, { col: 4, row: 11, tile: 0x91b },
]);

// case 20: Swamp Palace entrance
reg([20], [
  { col: 25, row: 10, tile: 0xdd1 }, { col: 26, row: 10, tile: 0xdd2 },
  { col: 25, row: 11, tile: 0xdd7 }, { col: 26, row: 11, tile: 0xdd8 },
  { col: 25, row: 12, tile: 0xdd9 }, { col: 26, row: 12, tile: 0xdda },
]);

// case 21-25, 32-33: Desert Palace entrance
reg([21, 22, 23, 24, 25, 32, 33], [
  { col: 31, row: 24, tile: 0xe21 }, { col: 33, row: 24, tile: 0xe21 },
  { col: 32, row: 24, tile: 0xe22 },
  { col: 31, row: 25, tile: 0xe23 }, { col: 32, row: 25, tile: 0xe24 },
  { col: 33, row: 25, tile: 0xe25 },
]);

// case 26-28, 35-36: Eastern Palace entrance (big screens → within left half)
reg([26, 27, 28, 35, 36], [
  { col: 30, row: 39, tile: 0xdc1 }, { col: 31, row: 39, tile: 0xdc2 },
  { col: 30, row: 40, tile: 0xdbe }, { col: 31, row: 40, tile: 0xdbf },
]);
// NOTE: patches at (32,39) and (33,39) etc target col>=32 → right quadrant
// They are registered separately for the +1 screen below

// case 29-31, 34, 37-43, 107: loc_8EF7B4 at XY(24, 6)
reg([29, 30, 31, 34, 37, 38, 39, 40, 41, 42, 43, 107], [
  { col: 24, row: 6, tile: 0x918 }, { col: 25, row: 6, tile: 0x919 },
  { col: 24, row: 7, tile: 0x91a }, { col: 25, row: 7, tile: 0x91b },
]);

// case 50-55, 119: loc_8EF7B4 at XY(6, 8)
reg([50, 51, 52, 53, 54, 55, 119], [
  { col: 6, row: 8, tile: 0x918 }, { col: 7, row: 8, tile: 0x919 },
  { col: 6, row: 9, tile: 0x91a }, { col: 7, row: 9, tile: 0x91b },
]);

// case 58: loc_8EF7B4 at XY(15, 20)
reg([58], [
  { col: 15, row: 20, tile: 0x918 }, { col: 16, row: 20, tile: 0x919 },
  { col: 15, row: 21, tile: 0x91a }, { col: 16, row: 21, tile: 0x91b },
]);

// case 59, 123: Skull Woods area (large set of patches, all within 32×32)
reg([59, 123], [
  { col: 22, row: 7, tile: 0xddf }, { col: 18, row: 8, tile: 0xddf },
  { col: 16, row: 9, tile: 0xddf }, { col: 15, row: 10, tile: 0xddf },
  { col: 14, row: 12, tile: 0xddf }, { col: 26, row: 14, tile: 0xddf },
  { col: 23, row: 7, tile: 0xde0 }, { col: 17, row: 9, tile: 0xde0 },
  { col: 24, row: 7, tile: 0xde1 }, { col: 28, row: 8, tile: 0xde1 },
  { col: 29, row: 9, tile: 0xde1 }, { col: 21, row: 11, tile: 0xde1 },
  { col: 29, row: 14, tile: 0xde1 },
  { col: 19, row: 8, tile: 0xde2 }, { col: 20, row: 8, tile: 0xde2 },
  { col: 21, row: 8, tile: 0xde2 }, { col: 25, row: 8, tile: 0xde2 },
  { col: 26, row: 8, tile: 0xde2 }, { col: 27, row: 8, tile: 0xde2 },
  { col: 22, row: 8, tile: 0xde3 }, { col: 18, row: 9, tile: 0xde3 },
  { col: 16, row: 10, tile: 0xde3 }, { col: 15, row: 12, tile: 0xde3 },
  { col: 23, row: 8, tile: 0xde4 }, { col: 19, row: 9, tile: 0xde4 },
  { col: 20, row: 9, tile: 0xde4 }, { col: 24, row: 9, tile: 0xde4 },
  { col: 27, row: 9, tile: 0xde4 }, { col: 17, row: 10, tile: 0xde4 },
  { col: 18, row: 10, tile: 0xde4 }, { col: 19, row: 10, tile: 0xde4 },
  { col: 28, row: 10, tile: 0xde4 }, { col: 16, row: 11, tile: 0xde4 },
  { col: 17, row: 11, tile: 0xde4 }, { col: 18, row: 11, tile: 0xde4 },
  { col: 19, row: 11, tile: 0xde4 }, { col: 16, row: 12, tile: 0xde4 },
  { col: 17, row: 12, tile: 0xde4 }, { col: 15, row: 13, tile: 0xde4 },
  { col: 16, row: 13, tile: 0xde4 }, { col: 15, row: 14, tile: 0xde4 },
  { col: 16, row: 14, tile: 0xde4 }, { col: 19, row: 16, tile: 0xde4 },
  { col: 19, row: 17, tile: 0xde4 }, { col: 20, row: 17, tile: 0xde4 },
  { col: 19, row: 18, tile: 0xde4 },
  { col: 24, row: 8, tile: 0xde5 }, { col: 28, row: 9, tile: 0xde5 },
  { col: 20, row: 11, tile: 0xde5 }, { col: 21, row: 12, tile: 0xde5 },
  { col: 21, row: 9, tile: 0xde6 }, { col: 25, row: 9, tile: 0xde6 },
  { col: 20, row: 10, tile: 0xde6 }, { col: 28, row: 11, tile: 0xde6 },
  { col: 21, row: 17, tile: 0xde6 }, { col: 20, row: 18, tile: 0xde6 },
  { col: 22, row: 9, tile: 0xde7 }, { col: 24, row: 10, tile: 0xde7 },
  { col: 15, row: 15, tile: 0xde7 }, { col: 16, row: 15, tile: 0xde7 },
  { col: 19, row: 19, tile: 0xde7 }, { col: 28, row: 19, tile: 0xde7 },
  { col: 23, row: 9, tile: 0xde8 }, { col: 26, row: 9, tile: 0xde8 },
  { col: 27, row: 10, tile: 0xde8 }, { col: 17, row: 15, tile: 0xde8 },
  { col: 18, row: 16, tile: 0xde8 },
  { col: 23, row: 10, tile: 0xde9 }, { col: 26, row: 10, tile: 0xde9 },
  { col: 14, row: 15, tile: 0xde9 }, { col: 17, row: 16, tile: 0xde9 },
  { col: 26, row: 18, tile: 0xde9 }, { col: 27, row: 19, tile: 0xde9 },
  { col: 29, row: 10, tile: 0xdea }, { col: 28, row: 12, tile: 0xdea },
  { col: 28, row: 13, tile: 0xdea }, { col: 29, row: 18, tile: 0xdea },
  { col: 15, row: 11, tile: 0xdeb }, { col: 27, row: 11, tile: 0xdeb },
  { col: 27, row: 12, tile: 0xdeb }, { col: 14, row: 13, tile: 0xdeb },
  { col: 27, row: 13, tile: 0xdeb }, { col: 14, row: 14, tile: 0xdeb },
  { col: 18, row: 17, tile: 0xdeb }, { col: 18, row: 18, tile: 0xdeb },
  { col: 18, row: 12, tile: 0xdec }, { col: 17, row: 13, tile: 0xdec },
  { col: 19, row: 12, tile: 0xded }, { col: 20, row: 12, tile: 0xdee },
  { col: 18, row: 13, tile: 0xdef }, { col: 27, row: 15, tile: 0xdef },
  { col: 19, row: 13, tile: 0xdf0 }, { col: 19, row: 14, tile: 0xdf0 },
  { col: 20, row: 14, tile: 0xdf0 }, { col: 21, row: 14, tile: 0xdf0 },
  { col: 21, row: 15, tile: 0xdf0 }, { col: 27, row: 16, tile: 0xdf0 },
  { col: 28, row: 16, tile: 0xdf0 },
  { col: 20, row: 13, tile: 0xdf1 }, { col: 28, row: 15, tile: 0xdf1 },
  { col: 21, row: 13, tile: 0xdf2 }, { col: 17, row: 14, tile: 0xdf3 },
  { col: 18, row: 15, tile: 0xdf3 }, { col: 20, row: 16, tile: 0xdf3 },
  { col: 18, row: 14, tile: 0xdf4 }, { col: 19, row: 15, tile: 0xdf5 },
  { col: 20, row: 15, tile: 0xdf6 }, { col: 27, row: 17, tile: 0xdf6 },
  { col: 26, row: 15, tile: 0xdf7 }, { col: 29, row: 15, tile: 0xdf8 },
  { col: 21, row: 16, tile: 0xdf9 }, { col: 26, row: 16, tile: 0xdfa },
  { col: 29, row: 16, tile: 0xdfb }, { col: 26, row: 17, tile: 0xdfc },
  { col: 28, row: 17, tile: 0xdfd }, { col: 29, row: 17, tile: 0xdfe },
  { col: 27, row: 18, tile: 0xdff }, { col: 28, row: 18, tile: 0xe00 },
  { col: 21, row: 10, tile: 0xe01 }, { col: 25, row: 10, tile: 0xe01 },
  { col: 21, row: 18, tile: 0xe01 },
  { col: 29, row: 11, tile: 0xe02 }, { col: 20, row: 19, tile: 0xe02 },
  { col: 29, row: 19, tile: 0xe02 },
  { col: 18, row: 19, tile: 0xe03 }, { col: 27, row: 14, tile: 0xe04 },
  { col: 28, row: 14, tile: 0xe05 },
]);

// case 60-65, 72-73: Ice Palace entrance
reg([60, 61, 62, 63, 64, 65, 72, 73], [
  { col: 8, row: 11, tile: 0xe13 }, { col: 11, row: 11, tile: 0xe14 },
  { col: 8, row: 12, tile: 0xe15 }, { col: 9, row: 12, tile: 0xe16 },
  { col: 10, row: 12, tile: 0xe17 }, { col: 11, row: 12, tile: 0xe18 },
  { col: 9, row: 13, tile: 0xe19 }, { col: 10, row: 13, tile: 0xe1a },
  { col: 9, row: 16, tile: 0xe06 }, { col: 10, row: 16, tile: 0xe06 },
  { col: 8, row: 14, tile: 0xe07 }, { col: 8, row: 15, tile: 0xe07 },
  { col: 9, row: 14, tile: 0xe08 }, { col: 9, row: 15, tile: 0xe08 },
  { col: 10, row: 14, tile: 0xe09 }, { col: 10, row: 15, tile: 0xe09 },
  { col: 11, row: 14, tile: 0xe0a }, { col: 11, row: 15, tile: 0xe0a },
]);

// case 66-68, 75-76: patches at col >= 32 (big screen right quadrant)
// XY(47, 8) → col=47, row=8. For big screens, this goes to the +1 (right) screen at col=47-32=15
// Registered for the adjacent screen instead — these screens' overlays only affect the right half

// case 69-70, 77-78: loc_8EF7B4 at XY(52, 16) → col=52, row=16 → right quadrant at (20, 16)
// Same: only affects right-half screen

// case 71: Misery Mire entrance (within 32×32)
reg([71], [
  { col: 15, row: 19, tile: 0xe78 }, { col: 16, row: 19, tile: 0xe79 },
  { col: 17, row: 19, tile: 0xe7a }, { col: 18, row: 19, tile: 0xe7b },
  { col: 15, row: 20, tile: 0xe7c }, { col: 16, row: 20, tile: 0xe7d },
  { col: 17, row: 20, tile: 0xe7e }, { col: 18, row: 20, tile: 0xe7f },
  { col: 15, row: 21, tile: 0xe80 }, { col: 16, row: 21, tile: 0xe81 },
  { col: 17, row: 21, tile: 0xe82 }, { col: 18, row: 21, tile: 0xe83 },
  { col: 15, row: 22, tile: 0xe84 }, { col: 16, row: 22, tile: 0xe85 },
  { col: 17, row: 22, tile: 0xe86 }, { col: 18, row: 22, tile: 0xe87 },
]);

// case 74, 79-89, 96-97: Thieves' Town entrance
reg([74, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 96, 97], [
  { col: 31, row: 26, tile: 0xe1b }, { col: 32, row: 26, tile: 0xe1c },
  { col: 31, row: 27, tile: 0xe1d }, { col: 32, row: 27, tile: 0xe1e },
  { col: 31, row: 28, tile: 0xe1f }, { col: 32, row: 28, tile: 0xe20 },
]);

// case 90-92, 99-100: Palace of Darkness entrance
reg([90, 91, 92, 99, 100], [
  { col: 30, row: 7, tile: 0xe3f }, { col: 31, row: 7, tile: 0xe40 },
  { col: 32, row: 7, tile: 0xe41 },
  { col: 30, row: 8, tile: 0xe42 }, { col: 31, row: 8, tile: 0xe43 },
  { col: 32, row: 8, tile: 0xe44 },
  { col: 30, row: 9, tile: 0xe45 }, { col: 31, row: 9, tile: 0xe46 },
  { col: 32, row: 9, tile: 0xe47 },
]);

// case 93-95, 102-103: Turtle Rock entrance (partially out of bounds for small screens)
reg([93, 94, 95, 102, 103], [
  // XY(51, 3) → col=51 ≥ 32 → right quadrant (skipped for left)
  // XY(53, 4-6) → col=53 ≥ 32 → right quadrant (skipped)
  // Only registering if we can handle the right side separately later
]);

// case 98: loc_8EF7B4 at XY(16, 26)
reg([98], [
  { col: 16, row: 26, tile: 0x918 }, { col: 17, row: 26, tile: 0x919 },
  { col: 16, row: 27, tile: 0x91a }, { col: 17, row: 27, tile: 0x91b },
]);

// case 101, 104-106, 108-113, 120-121: Ganon's Tower entrance (large)
reg([101, 104, 105, 106, 108, 109, 110, 111, 112, 113, 120, 121], [
  { col: 17, row: 10, tile: 0xe64 }, { col: 18, row: 10, tile: 0xe65 },
  { col: 19, row: 10, tile: 0xe66 }, { col: 20, row: 10, tile: 0xe67 },
  { col: 17, row: 11, tile: 0xe68 }, { col: 18, row: 11, tile: 0xe69 },
  { col: 19, row: 11, tile: 0xe6a }, { col: 20, row: 11, tile: 0xe6b },
  { col: 17, row: 12, tile: 0xe6c }, { col: 18, row: 12, tile: 0xe6d },
  { col: 19, row: 12, tile: 0xe6e }, { col: 20, row: 12, tile: 0xe6f },
  { col: 17, row: 13, tile: 0xe70 }, { col: 18, row: 13, tile: 0xe71 },
  { col: 19, row: 13, tile: 0xe72 }, { col: 20, row: 13, tile: 0xe73 },
  { col: 17, row: 14, tile: 0xe74 }, { col: 18, row: 14, tile: 0xe75 },
  { col: 19, row: 14, tile: 0xe76 }, { col: 20, row: 14, tile: 0xe77 },
]);

// ─── Big-screen right-quadrant patches (screen+1) ───────────────────────────

// case 44-49, 56-57: loc_8EF7B4 at XY(44, 6) → right quadrant col=44-32=12, row=6
reg([45, 46, 47, 48, 49, 50, 57, 58], [
  // These would be the +1 screens for big areas 44-49, 56-57
  // Registering against the RIGHT quadrant screen
  { col: 12, row: 6, tile: 0x918 }, { col: 13, row: 6, tile: 0x919 },
  { col: 12, row: 7, tile: 0x91a }, { col: 13, row: 7, tile: 0x91b },
]);

// case 26-28, 35-36: patches at col 32-33 → right quadrant
// XY(32, 39) → col=0, row=39 ≥ 32 → bottom quadrant. These target bottom screens.
// For now, these are out of bounds for our 32×32 analysis (row >= 32)

// case 66-68, 75-76: XY(47, 8) → right quadrant col=15, row=8
reg([67, 68, 69, 76, 77], [
  { col: 15, row: 8, tile: 0xe96 }, { col: 16, row: 8, tile: 0xe97 },
  { col: 15, row: 9, tile: 0xe9c }, { col: 15, row: 10, tile: 0xe9c },
  { col: 16, row: 9, tile: 0xe9d }, { col: 16, row: 10, tile: 0xe9d },
  { col: 15, row: 11, tile: 0xe9a }, { col: 16, row: 11, tile: 0xe9b },
]);

// case 69-70, 77-78: loc_8EF7B4 at XY(52, 16) → right quadrant col=20, row=16
reg([70, 71, 78, 79], [
  { col: 20, row: 16, tile: 0x918 }, { col: 21, row: 16, tile: 0x919 },
  { col: 20, row: 17, tile: 0x91a }, { col: 21, row: 17, tile: 0x91b },
]);

// ─── Secondary overlay: bomb doors ──────────────────────────────────────────

const SECONDARY_OVERLAY_POSITIONS: Record<number, number> = {
  // kSecondaryOverlayPerOw[screen] >> 1 gives the base position (stride 64)
  // Format: screen → position in 64-stride buffer
  24: 0x1c0c >> 1, 25: 0x1c0c >> 1,
  32: 0x1c0c >> 1, 33: 0x1c0c >> 1,
  52: 0x3b0 >> 1, 53: 0x180c >> 1, 54: 0x180c >> 1, 55: 0x288 >> 1,
  61: 0x180c >> 1, 62: 0x180c >> 1,
  88: 0x1ab6 >> 1, 89: 0x1ab6 >> 1,
  91: 0xe2e >> 1, 92: 0xe2e >> 1,
  96: 0x1ab6 >> 1, 97: 0x1ab6 >> 1,
  99: 0xe2e >> 1, 100: 0xe2e >> 1,
  124: 0x3b0 >> 1, 127: 0x288 >> 1,
};

/**
 * Get bomb door patches for a screen (triggered by save_ow_event_info[screen] & 0x02).
 * Returns patches within 32×32 bounds, or empty if out of bounds.
 */
function getBombDoorPatches(screenIndex: number): TilePatch[] {
  const pos = SECONDARY_OVERLAY_POSITIONS[screenIndex];
  if (pos === undefined) return [];
  const col = pos % 64;
  const row = Math.floor(pos / 64);
  if (col >= 31 || row >= 32) return []; // out of bounds for 32-wide buffer
  return [
    { col, row, tile: 0xdb4 },
    { col: col + 1, row, tile: 0xdb5 },
  ];
}

// ─── Unconditional patches (applied regardless of event flags) ──────────────

const UNCONDITIONAL_PATCHES: Record<number, TilePatch[]> = {
  // Screen 0x33 (51 decimal): always patches position 340 = XY(20, 5) → col=20, row=5
  0x33: [{ col: 20, row: 5, tile: 0x20f }],
  // Screen 0x2F (47 decimal): patches position 1497 = row=23, col=25
  0x2F: [{ col: 25, row: 23, tile: 0x20f }],
};

// ─── Public API ─────────────────────────────────────────────────────────────

export interface VariantState {
  /** save_ow_event_info[screen] byte for the current screen */
  eventFlags: number;
}

/**
 * Get all Map16 patches to apply to a screen given the current variant state.
 * Only returns patches within the 32×32 Map16 grid.
 */
export function getOverlayPatches(screenIndex: number, variant?: VariantState): TilePatch[] {
  const patches: TilePatch[] = [];

  // Unconditional patches
  const uncond = UNCONDITIONAL_PATCHES[screenIndex];
  if (uncond) patches.push(...uncond);

  if (!variant) return patches;

  // Event overlay (bit 0x20)
  if (variant.eventFlags & 0x20) {
    const eventPatches = EVENT_OVERLAY_PATCHES[screenIndex];
    if (eventPatches) {
      for (const p of eventPatches) {
        if (p.col < 32 && p.row < 32) patches.push(p);
      }
    }
  }

  // Bomb door overlay (bit 0x02)
  if (variant.eventFlags & 0x02) {
    patches.push(...getBombDoorPatches(screenIndex));
  }

  return patches;
}
