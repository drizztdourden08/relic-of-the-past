/* @layer shared-game @kind logic */
import { upgradeItemOfName, progressiveCapacityFamilyOf } from '@rotp/game-data';
import { PROGRESSION_ITEMS, USEFUL_ITEMS } from '../world/pool/item-classes.constants';
import { itemKeyOfName } from '../world/display-names/item-key-name';
import { DUNGEON_ITEM_RE, PROGRESSIVE_PREFIX } from './receipt-text.constants';
import { PIECE_BY_BASE } from './receipt-item-class.constants';
import type { ItemId } from '@rotp/game-data';
import type { ReceiptItemClass } from './receipt-item-class.type';

const isJunkName = (itemName: string): boolean => {
  const itemId = itemKeyOfName(itemName) as ItemId | undefined;
  return itemId === undefined || (!PROGRESSION_ITEMS.has(itemId) && !USEFUL_ITEMS.has(itemId));
};

const dungeonItemOf = (itemName: string): ReceiptItemClass | null => {
  const [, base, dungeon] = DUNGEON_ITEM_RE.exec(itemName) ?? [];
  if (base === undefined || dungeon === undefined) return null;
  const piece = PIECE_BY_BASE[base];
  return piece === undefined ? null : { kind: 'dungeon-item', piece, base, dungeon };
};

const classifyReceiptItem = (itemName: string): ReceiptItemClass => {
  const progressiveFamily = progressiveCapacityFamilyOf(itemName);
  if (progressiveFamily !== undefined) return { kind: 'capacity-progressive', family: progressiveFamily };
  if (itemName.startsWith(PROGRESSIVE_PREFIX)) {
    return { kind: 'progressive', slot: itemName.slice(PROGRESSIVE_PREFIX.length) };
  }
  const dungeonItem = dungeonItemOf(itemName);
  if (dungeonItem !== null) return dungeonItem;
  const upgrade = upgradeItemOfName(itemName);
  if (upgrade !== undefined) return { kind: 'capacity', family: upgrade.family, jump: upgrade.jump };
  if (isJunkName(itemName)) return { kind: 'junk' };
  return { kind: 'standard' };
};

export { classifyReceiptItem };
