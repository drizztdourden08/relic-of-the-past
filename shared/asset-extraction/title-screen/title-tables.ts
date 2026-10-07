/* @layer shared-asset-extraction @kind data */
/**
 * Where the title screen's pictures come from, resolved from the game's own setup
 * (Intro_InitializeMemory_darken, Overworld_LoadAllPalettes and the intro sword in
 * core/zelda3/src). The title loads main tileset 35, aux tileset 81 and sprite tileset
 * 125; the sheet ids below are those rows read out, so no tileset table is needed here.
 */

/** One 3bpp sheet expanded into 64 4bpp tiles at a VRAM word address. */
interface SheetSlot {
  vram: number;
  sheet: number;
  /** The fourth bitplane is the OR of the other three (Do3To4High), else zero. */
  high: boolean;
}

/** Background character data for BG1 (logo) and BG2 (lake and castle), 0x2000-0x3fff. */
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

/** The second OBJ name table (OBSEL 2), and the sprite sheet the intro sword is drawn from there. */
const TITLE_OBJ_NAMES = 0x5000;
const TITLE_SWORD_SLOT: SheetSlot = { vram: TITLE_OBJ_NAMES, sheet: 50, high: false };

/** The stripe list the NMI uploads when the logo appears (kBgTilemap_0). */
const TITLE_TILEMAP_STRIPES = 0x0cdd6d;

/** The tile EraseTileMaps_normal fills both tilemaps with before the stripes land. */
const TITLE_BLANK_TILE = 0x1ec;

/** Tilemap VRAM word address per layer (BG1SC 0x13, BG2SC 0x03). */
const TITLE_LOGO_MAP = 0x1000;
const TITLE_BACKGROUND_MAP = 0x0000;
const TITLE_BG_CHARS = 0x2000;

/**
 * A palette table copied into CGRAM: `rows` rows of `count` colours from `rom`
 * (table address + index * stride), starting at CGRAM word `dst`.
 */
interface PaletteLoad {
  rom: number;
  dst: number;
  count: number;
  rows: number;
}

/** Overworld_LoadAllPalettes with the title's indices (mode 5, aux 3/3/0, sp0l 11). */
const TITLE_PALETTE_LOADS: readonly PaletteLoad[] = [
  { rom: 0x9bd39e + 11 * 7 * 2, dst: 0x81, count: 7, rows: 1 },
  { rom: 0x9be6c8 + 5 * 35 * 2, dst: 0x21, count: 7, rows: 5 },
  { rom: 0x9be86c + 3 * 21 * 2, dst: 0x29, count: 7, rows: 3 },
  { rom: 0x9be86c + 3 * 21 * 2, dst: 0x59, count: 7, rows: 3 },
  { rom: 0x9be604, dst: 0x71, count: 7, rows: 1 },
  // LoadTriforceSpritePalette: kPolyhedralPalette into OBJ palette 5.
  { rom: 0x8cc425, dst: 0xd0, count: 8, rows: 1 },
];

/** One 16x16 sprite at rest: its first character, its place and whether it is mirrored. */
interface SpritePiece {
  char: number;
  x: number;
  y: number;
  flipX?: boolean;
}

const SWORD_REST_Y = 30;
const SWORD_CHARS = [0, 2, 0x20, 0x22, 4, 6, 8, 0xa, 0xc, 0xe];
const SWORD_X = [0x40, 0x40, 0x30, 0x50, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40];
const SWORD_Y = [0x10, 0x20, 0x28, 0x28, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80];

/** The intro sword at rest (Intro_PeriodicSwordAndIntroFlash). */
const TITLE_SWORD_PIECES: readonly SpritePiece[] = SWORD_CHARS.map((char, i) => ({
  char, x: SWORD_X[i], y: SWORD_REST_Y + SWORD_Y[i] - 8,
}));

/** OBJ palette 0, the row the sword's attribute byte (0x21) selects. */
const TITLE_SWORD_PALETTE = 8;

/**
 * The triforce: the polyhedral engine's one 64x64 triangle, drawn as three 4x4 grids of
 * 16x16 sprites where the pieces land (kIntroSprite0_XLimit/YLimit), the right-hand one
 * mirrored (kIntroTriforceOam_Left/Right). OBJ palette 5, from the second name table.
 */
const TRIFORCE_BITMAP_VRAM = 0x5800;
const TRIFORCE_GRID = [[0x80, 0x82, 0x84, 0x86], [0xa0, 0xa2, 0xa4, 0xa6], [0x88, 0x8a, 0x8c, 0x8e], [0xa8, 0xaa, 0xac, 0xae]];
const TRIFORCE_PIECES_AT = [{ x: 75, y: 88, flipX: false }, { x: 95, y: 48, flipX: false }, { x: 117, y: 88, flipX: true }];

const TITLE_TRIFORCE_PIECES: readonly SpritePiece[] = TRIFORCE_PIECES_AT.flatMap(({ x, y, flipX }) =>
  TRIFORCE_GRID.flatMap((row, r) => row.map((char, c) => ({ char, x: x + (flipX ? 48 - c * 16 : c * 16), y: y + r * 16, flipX }))));

const TITLE_TRIFORCE_PALETTE = 13;

export {
  TITLE_BACKGROUND_MAP, TITLE_BG_CHARS, TITLE_BG_SLOTS, TITLE_BLANK_TILE, TITLE_LOGO_MAP, TITLE_OBJ_NAMES,
  TITLE_PALETTE_LOADS, TITLE_SWORD_PALETTE, TITLE_SWORD_PIECES, TITLE_SWORD_SLOT, TITLE_TILEMAP_STRIPES,
  TITLE_TRIFORCE_PALETTE, TITLE_TRIFORCE_PIECES, TRIFORCE_BITMAP_VRAM,
};
export type { PaletteLoad, SheetSlot, SpritePiece };
