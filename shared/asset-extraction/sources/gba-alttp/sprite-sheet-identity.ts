/* @layer shared-asset-extraction @kind logic */
/**
 * The cartridge's enemy sheets are the base game's, under the same numbering.
 *
 * Proven by the three blocksets both tables define: for 21, 25 and 26 the cartridge's quartet
 * is byte-identical to the base game's. So the sheets themselves are a non-problem and
 * uploading their pixels is the wrong fix — enemies draw from tile numbers baked into the
 * engine's sprite code, which assume the base game's sheet in each slot.
 *
 * What the cartridge actually contributes is the COMPOSITION for the blocksets the base table
 * leaves empty, which is most of this dungeon's. This checks that a sheet id still names the
 * same art on both cartridges, so a wrong pointer table cannot ship quietly again.
 */
import { lzDecompressWithLen } from '../../asset-builder';
import { kCompSpritePtrs } from '../../data/tables';
import type { RomData } from '../../rom/rom-types';

/** Same numbering on both cartridges — kept named so a future divergence has somewhere to go. */
const BASE_SHEET_DELTA = 0;

/** A slot the cartridge leaves to whatever was already loaded. */
const SHEET_UNCHANGED = 0xff;

/** Sheets below this index are stored raw rather than compressed. */
const FIRST_COMPRESSED_SHEET = 12;
/** A sheet is 64 tiles; the base game stores them 3bpp, so 24 bytes each. */
const SOURCE_SHEET_BYTES = 0x600;
const SOURCE_TILE_BYTES = 24;
const TILES_PER_SHEET = 64;
/** The cartridge stores 4bpp, 32 bytes a tile. */
const TILE_BYTES = 32;

/** How well one cartridge sheet matches the base sheet it maps to. */
interface SheetMatch {
  cartridgeId: number;
  baseId: number;
  matchingTiles: number;
}

const baseSheet = (snes: RomData, id: number): Buffer => {
  const address = kCompSpritePtrs[id];
  if (id < FIRST_COMPRESSED_SHEET) return Buffer.from(snes.getBytes(address, SOURCE_SHEET_BYTES));
  return lzDecompressWithLen(snes, address).data;
};

/** Do the cartridge tile's first three planes equal the base game's 3bpp source for it? */
const shapeMatches = (cartridge: Buffer, source: Buffer): boolean => {
  for (let row = 0; row < 8; row++) {
    if (cartridge[row * 2] !== source[row * 2]) return false;
    if (cartridge[row * 2 + 1] !== source[row * 2 + 1]) return false;
    if (cartridge[16 + row * 2] !== source[16 + row]) return false;
  }
  return true;
};

/** Translate one cartridge sheet id into the base game's, leaving the "unchanged" marker alone. */
const toBaseSheetId = (cartridgeId: number): number =>
  cartridgeId === SHEET_UNCHANGED ? SHEET_UNCHANGED : cartridgeId - BASE_SHEET_DELTA;

/**
 * Check every referenced sheet against the base sheet it maps to, so a wrong delta cannot ship
 * quietly. Returns one row per sheet; a caller decides what to do with an imperfect match.
 */
const compareSpriteSheets = (
  snes: RomData,
  sheets: readonly { id: number; snes4bpp: Buffer }[],
): SheetMatch[] => sheets.map(({ id, snes4bpp }) => {
  const baseId = toBaseSheetId(id);
  const source = baseSheet(snes, baseId);
  let matchingTiles = 0;
  if (source.length >= SOURCE_SHEET_BYTES) {
    for (let tile = 0; tile < TILES_PER_SHEET; tile++) {
      const cartridge = snes4bpp.subarray(tile * TILE_BYTES, (tile + 1) * TILE_BYTES);
      if (shapeMatches(cartridge, source.subarray(tile * SOURCE_TILE_BYTES, (tile + 1) * SOURCE_TILE_BYTES))) {
        matchingTiles++;
      }
    }
  }
  return { cartridgeId: id, baseId, matchingTiles };
});

export { BASE_SHEET_DELTA, SHEET_UNCHANGED, compareSpriteSheets, toBaseSheetId };
export type { SheetMatch };
