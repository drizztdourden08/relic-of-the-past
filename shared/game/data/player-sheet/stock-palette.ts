/* @layer shared-game @kind data */
/**
 * The two glove colours, transcribed from the core.
 *
 * Unlike the outfit palettes these are not an extracted asset — the decompilation carries
 * them as a literal (`kGlovesColor` in core/zelda3/src/load_gfx.c:12), and the palette
 * loader writes the one the current glove level selects over a single row entry. A sheet
 * that ships no glove words of its own falls back to these, which is what
 * PlayerSprite_Apply does as well.
 */

const STOCK_GLOVES: readonly [number, number] = [0x52f6, 0x0376];

export { STOCK_GLOVES };
