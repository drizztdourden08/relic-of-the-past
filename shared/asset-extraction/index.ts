/* @layer shared-asset-extraction @kind logic */
export {
  type RomData, type RomLanguage, type RomIdentEntry,
  snesToLinear, advanceAddress, advanceAddressWord,
  loadRom, loadRomFromBuffer, ZELDA3_SHA1, ZELDA3_SHA1_US,
  RomReader,
} from './rom';

export {
  decompress, decompressFromRom, decompressFromRomWithLength,
  decodeBrr, encodeBrr,
} from './compression';

export {
  type RGBA,
  snesToRgba, TRANSPARENT, loadPalette,
  decode2bppTile, decode3bppTile, decode4bppTile,
  decode2bppTileset, decode3bppTileset, decode4bppTileset,
  flipTileX, flipTileY,
  ImageBuffer,
} from './graphics';

export { kCompSpritePtrs, kCompBgPtrs } from './data';

export {
  extractAllItemSprites, extractAllItemSpritesFromRom,
  type ExtractionResult,
} from './item-sprites';

export { ALTTP_GBA_US_SHA256, GbaRomReader, loadGbaAlttpRomFromBuffer } from './rom/gba-rom';
export { GbaAlttpDungeonSource, PALACE_ROOM_IDS, extractPalaceSnes4bppTiles } from './sources/gba-alttp';
export { compileGbaAlttpSupplement } from './compile-resources-gba-alttp';
export { compileAlttpAssetSet } from './compile-alttp-asset-set';
export type { AlttpAssetSources, CompiledAlttpAssetSet } from './compile-alttp-asset-set';
