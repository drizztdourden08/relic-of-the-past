/* @layer shared-game @kind barrel */
import './bootstrap';

export {
  all, find, findOne,
  getActor, getActorByGameId, getArea, getCheck, getCheckByGameId, getConnection,
  getDungeon, getDungeonByGameId, getItem, getItemByGameId, getLocation, getScreen, getScreenByGameId,
  getTag,
} from './facade';
export * from './types';
export { registerRecord, replaceRecord, unregisterRecord } from './session-records';
export {
  ALL_TAGS, checkTagKeysOf, connectionTagKeysOf, hasTagKey, isTagKey, registerTag, replaceTagRecord,
  screenTagKeysOf, splitTagKey, tagById, tagByKey, tagIdForKey, tagIdsForKeys, tagKey, tagKeysOf, tagsFor,
  unregisterTag,
} from './tags';
export { TAG_METADATA, TAG_NAMESPACES } from './taxonomy/screen-tags';
export type { ScreenTag } from './taxonomy/screen-tags';
export { CONNECTION_TAG_METADATA, CONNECTION_TAG_NAMESPACES } from './taxonomy/connection-tags';
export type { ConnectionTag } from './taxonomy/connection-tags';
export { CONTENT_TAG_METADATA, CONTENT_TAG_NAMESPACES } from './taxonomy/check-content-tags';
export type { ContentTag } from './taxonomy/check-content-tags';
export { ITEM_CATEGORY_LABELS } from './taxonomy/item-categories';
export {
  ALL_ITEM_GROUPS, ITEM_GROUP_IDS, itemGroupById, membersOf, registerItemGroupRecord, replaceItemGroupRecord,
  unregisterItemGroupRecord,
} from './item-groups';
export {
  ALL_ENUMERATION, enumerationFor, labelOf, registerEnumerationRecord, replaceEnumerationRecord,
} from './enumeration';
export type { InventoryCategory, InventorySlot, InventoryViewMode } from './types/inventory';
export { COMPACT_LAYOUT, INGAME_EQUIPMENT, INGAME_ITEMS_GRID, INGAME_PASSIVES, INVENTORY_LAYOUT } from './inventory-layouts';
export { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from './sprite-manifest/manifest';
export type { SpriteCategory, SpriteManifestEntry } from './sprite-manifest/manifest';
export { PICTURE_GLYPH_SPRITES, pictureGlyphSpriteByName } from './sprite-manifest/picture-glyph-sprites';
export type { GlyphSpan, PictureGlyphSprite } from './sprite-manifest/picture-glyph-sprites';
export { directionOf, isReachable, toScreenIdOf } from './connections/derive';
export { pendingPartnerId, pendingPartnerScreenId } from './connections/pending-partner';
