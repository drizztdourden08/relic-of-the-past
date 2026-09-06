/* @layer shared-asset-extraction @kind logic */
/**
 * Reads a user ROM and writes the asset blob the game core loads. A TypeScript port of
 * upstream's Python tools, so end users need no Python runtime.
 */

// ROM layer
export {
  type RomData, type RomLanguage, type RomIdentEntry,
  snesToLinear, advanceAddress, advanceAddressWord,
  loadRom, loadRomFromBuffer, ZELDA3_SHA1, ZELDA3_SHA1_US,
  RomReader,
} from './rom';

// Compression codecs
export {
  decompress, decompressFromRom, decompressFromRomWithLength,
  decodeBrr, encodeBrr,
} from './compression';

// Graphics
export {
  type RGBA,
  snesToRgba, TRANSPARENT, loadPalette,
  decode2bppTile, decode3bppTile, decode4bppTile,
  decode2bppTileset, decode3bppTileset, decode4bppTileset,
  flipTileX, flipTileY,
  ImageBuffer,
} from './graphics';

// Data tables
export { kCompSpritePtrs, kCompBgPtrs } from './data';

// Item sprite extraction (Pipeline 2)
export {
  extractAllItemSprites, extractAllItemSpritesFromRom,
  type ExtractionResult,
} from './item-sprites';
