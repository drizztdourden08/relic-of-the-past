/**
 * Asset extraction pipeline — TypeScript port of core/zelda3/assets/ Python tools.
 * Eliminates the Python runtime dependency for end users.
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
