/* @layer shared-asset-extraction @kind barrel */
export {
  GbaAlttpDungeonSource,
} from './dungeon-source';
export {
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from './graphics-source';
export {
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
} from './behavior-source';
export type { GbaEntityHandlerRecord, GbaRoomTagHandlerRecord } from './behavior-source';
export {
  extractGbaAlttpText,
} from './text-source';
export type { GbaAlttpTextMessage } from './text-source';
export { GBA_ALTTP_ASSET_MANIFEST } from './asset-manifest';
export { AUX_TILE_THEME, assertBlocksetIdentity } from './blockset-identity';
export { compareSpriteSheets } from './sprite-sheet-identity';
