/* @layer shared-game @kind logic */
import { getItem, isProgressiveCapacityItemName } from '@rotp/game-data';
import { familyOfDungeonItem } from '../../world/dungeon-items/dungeon-item-modes';
import { itemKeyName } from '../../world/display-names/item-key-name';
import { ITEM } from '../../world/item-ids';
import { PROGRESSIVE_PREFIX } from '../receipt-text.constants';
import { BOTTLES, CRYSTALS, PENDANTS } from './receipt-counts.constants';
import type { ItemKey } from '../../world/item-ids';

const fixedClassOf = (item: ItemKey): string | undefined => {
  if (item === ITEM.pieceOfHeart) return 'heart-piece';
  if (item === ITEM.bossHeartContainer || item === ITEM.sanctuaryHeartContainer) return 'heart-container';
  if (BOTTLES.has(item)) return 'bottle';
  if (CRYSTALS.has(item)) return 'crystal';
  if (PENDANTS.has(item)) return 'pendant';
  if (item === ITEM.triforcePiece) return 'triforce';
  return undefined;
};

const countClassOf = (item: ItemKey): string | undefined => {
  const family = familyOfDungeonItem(item);
  if (family === 'smallKey') return `small-key:${getItem(item).dungeonId ?? item}`;
  const fixed = fixedClassOf(item);
  if (fixed !== undefined) return fixed;
  const name = itemKeyName(item);
  if (name.startsWith(PROGRESSIVE_PREFIX) && !isProgressiveCapacityItemName(name)) return `progressive:${item}`;
  return undefined;
};

export { countClassOf };
