/* @layer shared-asset-extraction @kind barrel */
export {
  GbaAlttpDungeonSource,
  INTERACTION_ATTRIBUTES,
  PALACE_ROOM_IDS,
  TILE_ATTRIBUTE_BANK_POINTERS,
} from './dungeon-source';
export {
  PALACE_SHEETS,
  PALACE_SPRITE_PALETTES,
  SPRITE_SHEET_POINTER_TABLE,
  SPRITE_TILESET_TABLE,
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from './graphics-source';
export {
  GBA_NEW_ENTITY_HANDLERS,
  PALACE_AUDIO_REFERENCES,
  PALACE_BEHAVIOR_SPECS,
  PALACE_BOSS_ROOMS,
  PALACE_ENTITY_TYPES,
  PALACE_PROGRESSION_ANCHORS,
  PALACE_ROOM_TAGS,
  ROOM_TAG_HANDLER_TABLE,
} from './palace-metadata';
export {
  ENTITY_HANDLER_COUNT,
  ENTITY_HANDLER_TABLE,
  ROOM_TAG_HANDLER_COUNT,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
} from './behavior-source';
export type { GbaEntityHandlerRecord, GbaRoomTagHandlerRecord } from './behavior-source';
export {
  GBA_SAVE_SIGNATURE,
  GBA_SAVE_SLOT_COUNT,
  GBA_SAVE_SLOT_DATA,
  GBA_SAVE_SLOT_STRIDE,
  decodeGbaAlttpSaveProgression,
  normalizeGbaAlttpSave,
  slotChecksum,
} from './progression-source';
export type { GbaAlttpSaveSlotProgression } from './progression-source';
export {
  GBA_EXCLUSIVE_TEXT_IDS,
  TEXT_BASE,
  TEXT_COUNT,
  TEXT_DATA_BLOCK,
  TEXT_POINTER_TABLE,
  decodeTextByte,
  extractGbaAlttpText,
} from './text-source';
export type { GbaAlttpTextMessage } from './text-source';
