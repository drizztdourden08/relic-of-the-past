/* @layer shared-game @kind logic */
export { ITEMS, type ItemDefinition } from './definitions';
export { ITEM_GROUPS } from './groups';
export { ITEM_ID_TO_NAME } from './id-map';
export {
  ITEM_SPRITE_MAP,
  getItemSprite,
  setSpritesBase,
  getSpritesBase,
  resolveItemSprite,
  INVENTORY_ITEMS,
  INVENTORY_LAYOUT,
  INGAME_ITEMS_GRID,
  INGAME_EQUIPMENT,
  INGAME_PASSIVES,
  COMPACT_LAYOUT,
  type InventorySlot,
  type InventoryCategory,
  type InventoryViewMode,
} from './sprites';
export { resolveDuplicate, isDuplicated, itemLabel, DUPLICATE_ALTERNATES } from './duplicate-alternates';
