/* @layer shared-game @kind data */
/**
 * The player-character sheet as the studio and the core both understand it.
 *
 * A sheet is `0x7000` bytes of 4bpp tiles (16 columns x 56 rows) holding every pose the
 * engine can draw, plus a palette. The palette is kept as two layers: `original` is what
 * the file was imported with (or the stock colours), `override` a sparse diff of edits.
 * Reverting is dropping the diff, so an edit never destroys what it replaced — and both
 * layers survive being written to a pack and read back.
 *
 * `PlayerSprite_Apply` (core/game-hooks/player_sprite.c) reads four outfits of 15 colours
 * then two glove colours, so those are exactly the slots modelled here. The fifth outfit
 * in the stock asset is the flash palette used while the player is zapped; no sheet format
 * carries it and the core deliberately leaves the player on the shared row for it.
 */

/** The four outfits a sheet supplies. The first three are recolours; `bunny` is its own art. */
type OutfitId = 'green' | 'blue' | 'red' | 'bunny';

/** 0 = none, 1 and 2 pick one of the two glove colours. */
type GloveLevel = 0 | 1 | 2;

/** 15 BGR555 words, for pixel indices 1-15. Index 0 is transparent and has no entry. */
type OutfitPalette = readonly number[];

interface SheetPalette {
  outfits: Record<OutfitId, OutfitPalette>;
  gloves: readonly [number, number];
}

/**
 * A sparse edit layer over a SheetPalette: only the outfits and the glove pair that were
 * actually changed appear, so an untouched colour keeps reading from the original.
 */
interface PaletteOverride {
  outfits?: Partial<Record<OutfitId, OutfitPalette>>;
  gloves?: readonly [number, number];
}

/** What the player is wearing — the second axis of the preview, and palette-only. */
interface Wearing {
  outfit: OutfitId;
  gloves: GloveLevel;
}

interface SheetMeta {
  name: string;
  author: string;
  /**
   * The author again, in the short ASCII form the container carries for an in-game credit
   * line. Kept separate because it is a third string in the file, not a derived one.
   */
  authorShort: string;
  notes?: string;
}

interface PlayerSheet {
  /** 0x7000 bytes: 896 tiles of 4bpp, 16 per row. */
  pixels: Uint8Array;
  original: SheetPalette;
  override: PaletteOverride;
  meta: SheetMeta;
}

const SHEET_BYTES = 0x7000;
const SHEET_COLS = 16;
const COLORS_PER_OUTFIT = 15;
const OUTFIT_IDS: readonly OutfitId[] = ['green', 'blue', 'red', 'bunny'];

/** Index of the row entry the glove colour lands on — CGRAM 0xFD in the core. */
const GLOVES_INDEX = 13;

export { SHEET_BYTES, SHEET_COLS, COLORS_PER_OUTFIT, OUTFIT_IDS, GLOVES_INDEX };
export type { OutfitId, GloveLevel, OutfitPalette, SheetPalette, PaletteOverride, Wearing, SheetMeta, PlayerSheet };
