/* @layer shared-game @kind barrel */
import './bootstrap';

export {
  all, find, findOne,
  getActor, getActorByGameId, getArea, getCheck, getCheckByGameId, getConnection,
  getDungeon, getDungeonByGameId, getItem, getItemByGameId, getLocation, getScreen, getScreenByGameId,
  getTag,
} from './facade';
export * from './types';
export { NATIVE_RECEIVE_TABLE_SIZE, asNativeReceiveId, isNativeReceiveId } from './native-receive-id';
export {
  UPGRADE_VIRT_FIRST, UPGRADE_VIRT_LAST, WALLET_VIRT_FIRST, WALLET_VIRT_LAST,
  isGrantableReceiveId, isUpgradeReceiveId, isWalletReceiveId, upgradeFamilyOfReceiveId,
  upgradeItemNameOfReceiveId, upgradeJumpOfReceiveId, upgradeReceiveIdOf, upgradeReceiveIdOfItem,
  upgradeReceiveIdOfName, walletSlotOfReceiveId,
} from './upgrade-receive-id';
export {
  capacityFamilyOfItemName, isCapacityUpgradeItemName, maxUpgradeJumpOf, upgradeItemName, upgradeItemOfName,
} from './capacity-upgrade-item';
export {
  isProgressiveCapacityItemName, progressiveCapacityFamilyOf, progressiveCapacityItemName,
} from './capacity-progressive-item';
export {
  PROGRESSIVE_CAPACITY_VIRT_FIRST, PROGRESSIVE_CAPACITY_VIRT_LAST, isProgressiveCapacityReceiveId,
  progressiveCapacityFamilyOfReceiveId, progressiveCapacityItemNameOfReceiveId, progressiveCapacityReceiveIdOf,
  progressiveCapacityReceiveIdOfName,
} from './capacity-progressive-receive-id';
export type { CapacityUpgradeItem } from './capacity-upgrade-item';
export {
  CAPACITY_FAMILY_IDS, CAPACITY_PROGRESSIVE_NAMES, CAPACITY_RECEIPT_LABELS, CAPACITY_UPGRADE_NAMES,
} from './capacity-upgrade-names.data';
export type { CapacityFamilyId, StepFamilyId } from './capacity-family.type';
export {
  WALLET_SLOT_COUNT, walletJumpOfSlot, walletJumpTableOf, walletSlotOfJump,
} from './wallet-jump-table';
export {
  isProgressiveReceiveId, progressiveReceiveIdOfItem, progressiveReceiveIdOfName,
} from './progressive-receive-id';
export {
  isPrizeReceiveId, prizeReceiveIdOfItem, prizeReceiveIdOfName, vanillaPrizeGrantIdOfName,
} from './prize-receive-id';
export {
  DUNGEON_ITEM_NATIVE_IDS, DUNGEON_ITEM_PALACE_COUNT, DUNGEON_ITEM_VIRT_FIRST, DUNGEON_ITEM_VIRT_LAST,
  dungeonItemKindOfReceiveId, dungeonItemNativeIdOfReceiveId, dungeonItemPalaceOfReceiveId,
  dungeonItemReceiveIdOf, isDungeonItemReceiveId,
} from './dungeon-item-receive-id';
export { dungeonItemReceiveIdOfName, dungeonItemReceiveIdOfRecord } from './dungeon-item-target';
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
