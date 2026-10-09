/* @layer shared-game @kind logic */
import { getItem } from '@shared/game/data';
import { isProgressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import { familyOfDungeonItem } from '../../world/dungeon-items/dungeon-item-modes';
import { itemKeyName } from '../../world/display-names/item-key-name';
import { ITEM } from '../../world/item-ids.data';
import { PROGRESSIVE_PREFIX } from '../receipt-text.constants';
import { BOTTLES, CRYSTALS, PENDANTS } from './receipt-counts.constants';
import type { ItemKey } from '../../world/item-ids.data';

const countClassOf = (item: ItemKey): string | undefined => {
  const family = familyOfDungeonItem(item);
  if (family === 'smallKey') return `small-key:${getItem(item).dungeonId ?? item}`;
  if (item === ITEM.pieceOfHeart) return 'heart-piece';
  if (item === ITEM.bossHeartContainer || item === ITEM.sanctuaryHeartContainer) return 'heart-container';
  if (BOTTLES.has(item)) return 'bottle';
  if (CRYSTALS.has(item)) return 'crystal';
  if (PENDANTS.has(item)) return 'pendant';
  if (item === ITEM.triforcePiece) return 'triforce';
  const name = itemKeyName(item);
  if (name.startsWith(PROGRESSIVE_PREFIX) && !isProgressiveCapacityItemName(name)) return `progressive:${item}`;
  return undefined;
};

export { countClassOf };
