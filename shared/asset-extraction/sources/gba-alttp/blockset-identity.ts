/* @layer shared-asset-extraction @kind logic */
/**
 * The extra dungeon's background blockset is a base-game blockset.
 *
 * Measured against the base cartridge: the eight 64-tile sheets are packs 0, 1, 17, 12, 14,
 * 37, 27, 15 — exactly what the engine composes from main theme 9 plus aux theme 9 — and 453
 * of the 512 tiles are byte-identical to those packs in planes 0-2. Five of the eight sheets
 * match 64 out of 64.
 *
 * What that buys is tile ids: the room maps address the base game's own tiles by the base
 * game's own numbers, which is what makes derived collision and rebuilt object streams
 * possible at all. What it does NOT buy is the pixels. The base game stores background art as
 * 3bpp and synthesises the fourth plane on load — zero for some VRAM slots, the OR of the
 * other three for others — while this port stores real 4bpp and re-encoded three sheets to
 * carry their colour in the palette instead. So the sheet still has to be uploaded whole; the
 * theme indices are for everything the engine DERIVES from a blockset.
 *
 * This module is the guard on that claim. If a future extraction drifts far enough that the
 * tiles are no longer the base game's, the build fails here rather than shipping rooms whose
 * ids mean something else.
 */
import { lzDecompressWithLen } from '../../asset-builder';
import { kCompBgPtrs } from '../../data/tables';
import type { RomData } from '../../rom/rom-types';

/** main_tile_theme_index — the entrance record's blockset field carries it. */
const MAIN_TILE_THEME = 9;
/** aux_tile_theme_index — the room header's third byte carries it. */
const AUX_TILE_THEME = 9;

/** The packs those two themes resolve to, in VRAM order. */
const SHEET_PACKS = [0, 1, 17, 12, 14, 37, 27, 15] as const;

const TILES_PER_SHEET = 64;
/** A 3bpp tile as the base game stores it: planes 0 and 1 interleaved, then plane 2. */
const SOURCE_TILE_BYTES = 24;
/** A 4bpp tile as the port stores it, and as VRAM holds it. */
const TILE_BYTES = 32;

/** Below this the blockset identity no longer holds and nothing downstream is safe. */
const MIN_MATCHING_TILES = 440;

/** Do the port's planes 0-2 for one tile equal the base game's 3bpp source for it? */
const shapeMatches = (port: Buffer, source: Buffer): boolean => {
  for (let row = 0; row < 8; row++) {
    if (port[row * 2] !== source[row * 2]) return false;
    if (port[row * 2 + 1] !== source[row * 2 + 1]) return false;
    if (port[16 + row * 2] !== source[16 + row]) return false;
  }
  return true;
};

/**
 * Count the port's tiles whose shape is the base game's, and fail the build when too few are.
 * Returns the count so a caller can report it.
 */
const assertBlocksetIdentity = (snes: RomData, portSheet: Buffer): number => {
  const expected = SHEET_PACKS.length * TILES_PER_SHEET * TILE_BYTES;
  if (portSheet.length !== expected) {
    throw new Error(`Expected ${expected} bytes of background tiles, found ${portSheet.length}`);
  }
  let matching = 0;
  SHEET_PACKS.forEach((pack, sheet) => {
    const { data } = lzDecompressWithLen(snes, kCompBgPtrs[pack]);
    for (let tile = 0; tile < TILES_PER_SHEET; tile++) {
      const at = (sheet * TILES_PER_SHEET + tile) * TILE_BYTES;
      const source = data.subarray(tile * SOURCE_TILE_BYTES, (tile + 1) * SOURCE_TILE_BYTES);
      if (shapeMatches(portSheet.subarray(at, at + TILE_BYTES), source)) matching++;
    }
  });
  if (matching < MIN_MATCHING_TILES) {
    throw new Error(`Only ${matching} background tiles match themes ${MAIN_TILE_THEME}/${AUX_TILE_THEME}; the blockset identity no longer holds`);
  }
  return matching;
};

export { AUX_TILE_THEME, MAIN_TILE_THEME, assertBlocksetIdentity };
