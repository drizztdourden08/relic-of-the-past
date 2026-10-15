/* @layer shared-asset-extraction @kind data */
import type { PaletteLoad, SheetSlot, TriforcePieceAnchor } from './title-tables.type';

const TITLE_BG_SLOTS: readonly SheetSlot[] = [
  { vram: 0x2000, sheet: 22, high: true },
  { vram: 0x2400, sheet: 57, high: false },
  { vram: 0x2800, sheet: 29, high: false },
  { vram: 0x2c00, sheet: 23, high: true },
  { vram: 0x3000, sheet: 64, high: true },
  { vram: 0x3400, sheet: 65, high: true },
  { vram: 0x3800, sheet: 57, high: false },
  { vram: 0x3c00, sheet: 30, high: false },
];

const TITLE_OBJ_NAMES = 0x5000;

const TITLE_SWORD_SLOT: SheetSlot = { vram: TITLE_OBJ_NAMES, sheet: 50, high: false };

const TITLE_TILEMAP_STRIPES = 0x0cdd6d;

const TITLE_BLANK_TILE = 0x1ec;

const TITLE_LOGO_MAP = 0x1000;

const TITLE_BACKGROUND_MAP = 0x0000;

const TITLE_BG_CHARS = 0x2000;

const POLYHEDRAL_PALETTE = 0x8cc425;

const TRIFORCE_OBJ_PALETTE_CGRAM = 0xd0;

const TITLE_PALETTE_LOADS: readonly PaletteLoad[] = [
  { rom: 0x9bd39e + 11 * 7 * 2, dst: 0x81, count: 7, rows: 1 },
  { rom: 0x9be6c8 + 5 * 35 * 2, dst: 0x21, count: 7, rows: 5 },
  { rom: 0x9be86c + 3 * 21 * 2, dst: 0x29, count: 7, rows: 3 },
  { rom: 0x9be86c + 3 * 21 * 2, dst: 0x59, count: 7, rows: 3 },
  { rom: 0x9be604, dst: 0x71, count: 7, rows: 1 },
  { rom: POLYHEDRAL_PALETTE, dst: TRIFORCE_OBJ_PALETTE_CGRAM, count: 8, rows: 1 },
];

const SWORD_REST_Y = 30;

const SWORD_CHARS: readonly number[] = [0, 2, 0x20, 0x22, 4, 6, 8, 0xa, 0xc, 0xe];

const SWORD_X: readonly number[] = [0x40, 0x40, 0x30, 0x50, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40];

const SWORD_Y: readonly number[] = [0x10, 0x20, 0x28, 0x28, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80];

const TITLE_SWORD_PALETTE = 8;

const TRIFORCE_BITMAP_VRAM = 0x5800;

const TRIFORCE_GRID: readonly (readonly number[])[] = [
  [0x80, 0x82, 0x84, 0x86],
  [0xa0, 0xa2, 0xa4, 0xa6],
  [0x88, 0x8a, 0x8c, 0x8e],
  [0xa8, 0xaa, 0xac, 0xae],
];

const TRIFORCE_PIECES_AT: readonly TriforcePieceAnchor[] = [
  { x: 75, y: 88, flipX: false },
  { x: 95, y: 48, flipX: false },
  { x: 117, y: 88, flipX: true },
];

const TITLE_TRIFORCE_PALETTE = 13;

export {
  SWORD_CHARS, SWORD_REST_Y, SWORD_X, SWORD_Y, TITLE_BACKGROUND_MAP, TITLE_BG_CHARS, TITLE_BG_SLOTS, TITLE_BLANK_TILE,
  TITLE_LOGO_MAP, TITLE_OBJ_NAMES, TITLE_PALETTE_LOADS, TITLE_SWORD_PALETTE, TITLE_SWORD_SLOT, TITLE_TILEMAP_STRIPES,
  TITLE_TRIFORCE_PALETTE, TRIFORCE_BITMAP_VRAM, TRIFORCE_GRID, TRIFORCE_PIECES_AT,
};
