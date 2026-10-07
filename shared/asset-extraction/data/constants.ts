/* @layer shared-asset-extraction @kind constants */
/**
 * Named ROM addresses used by asset extraction.
 * Replaces magic numbers scattered throughout the Python code.
 */

// ─── Palette addresses ─────────────────────────────────────────────────────
/** HUD palette: 16 sub-palettes × 4 colors (64 words) */
const ADDR_HUD_PALETTE = 0x9bd660;

/** Main sprite palettes (palettes 1-4): 4 × 15 colors (120 words) */
const ADDR_SPRITE_PALETTE_MAIN = 0x9bd218;

/** Auxiliary sprite palette data (168 words) */
const ADDR_SPRITE_PALETTE_AUX1 = 0x9bd4e0;

/** Auxiliary sprite palette 3 for palette 0 (84 words) */
const ADDR_SPRITE_PALETTE_AUX3 = 0x9bd39e;

/** Sword palette colors (4 swords × 3 colors = 12 words) */
const ADDR_SWORD_PALETTE = 0x9bd630;

/** Shield palette colors (3 shields × 4 colors = 12 words) */
const ADDR_SHIELD_PALETTE = 0x9bd648;

/** Player armor palette (Green Mail = armor 0, 15 colors) */
const ADDR_ARMOR_PALETTE = 0x9bd308;

// ─── Background palette addresses ──────────────────────────────────────────
/** Indoor background palettes: 90 words per set (6 rows × 15 colors) */
const ADDR_DUNGEON_BG_MAIN = 0x9bd734;

/** Outdoor background main palettes: 35 words per mode (5 rows × 7 colors) */
const ADDR_OVERWORLD_BG_MAIN = 0x9be6c8;

/** Outdoor background auxiliary palettes: 21 words per index (3 rows × 7 colors) */
const ADDR_OVERWORLD_BG_AUX12 = 0x9be86c;

/** Outdoor background third auxiliary palette: 7 words per index (one row) */
const ADDR_OVERWORLD_BG_AUX3 = 0x9be604;

export {
  ADDR_ARMOR_PALETTE,
  ADDR_DUNGEON_BG_MAIN,
  ADDR_HUD_PALETTE,
  ADDR_OVERWORLD_BG_AUX12,
  ADDR_OVERWORLD_BG_AUX3,
  ADDR_OVERWORLD_BG_MAIN,
  ADDR_SHIELD_PALETTE,
  ADDR_SPRITE_PALETTE_AUX1,
  ADDR_SPRITE_PALETTE_AUX3,
  ADDR_SPRITE_PALETTE_MAIN,
  ADDR_SWORD_PALETTE
};
