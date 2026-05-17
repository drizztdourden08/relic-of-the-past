/**
 * Named ROM addresses used by asset extraction.
 * Replaces magic numbers scattered throughout the Python code.
 */

// ─── Palette addresses ─────────────────────────────────────────────────────
/** HUD palette: 16 sub-palettes × 4 colors (64 words) */
export const ADDR_HUD_PALETTE = 0x9bd660;

/** Main sprite palettes (palettes 1-4): 4 × 15 colors (120 words) */
export const ADDR_SPRITE_PALETTE_MAIN = 0x9bd218;

/** Auxiliary sprite palette data (168 words) */
export const ADDR_SPRITE_PALETTE_AUX1 = 0x9bd4e0;

/** Auxiliary sprite palette 3 (84 words) — palette 0 */
export const ADDR_SPRITE_PALETTE_AUX3 = 0x9bd39e;

/** Sword palette colors (4 swords × 3 colors = 12 words) */
export const ADDR_SWORD_PALETTE = 0x9bd630;

/** Shield palette colors (3 shields × 4 colors = 12 words) */
export const ADDR_SHIELD_PALETTE = 0x9bd648;

/** Link armor palette (Green Mail = armor 0, 15 colors) */
export const ADDR_ARMOR_PALETTE = 0x9bd308;
