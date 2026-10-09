/* @layer shared-game @kind logic */
import { itemKeyOfName } from '../../world/display-names/item-key-name';
import { RETRO_QUIVER_ITEM } from '../../world/retro/retro-bow.data';
import { countClassOf } from '../receipt-counts';
import { DIRECT_FLAVOUR_KEYS } from './receipt-flavour.constants';
import type { FlavourKey } from './receipt-flavour.type';

const flavourKeyOf = (itemName: string, isDungeonItem: boolean): FlavourKey => {
  const item = itemKeyOfName(itemName);
  if (item === RETRO_QUIVER_ITEM) return 'quiver';
  const countClass = countClassOf(item);
  if (countClass !== undefined) {
    if (countClass.startsWith('small-key:')) return 'small-key';
    if (countClass.startsWith('progressive:')) return 'progressive';
    if (DIRECT_FLAVOUR_KEYS.has(countClass)) return countClass as FlavourKey;
  }
  return isDungeonItem ? 'dungeon-item' : 'standard';
};

export { flavourKeyOf };
