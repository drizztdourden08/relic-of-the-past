/* @layer shared-game @kind constants */
import { EXPLOSIVES_UPGRADE_NAMES, PROJECTILES_UPGRADE_NAMES } from '@rotp/game-data';
import { itemKeyOfName } from '../display-names/item-key-name';
import { RETRO_QUIVER_ITEM } from '../retro/retro-bow.data';
import { itemsClassed } from './items-classed';
import type { ItemKey } from '../item-ids.data';

const PROGRESSION_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>([
  ...itemsClassed('progression'),
  ...EXPLOSIVES_UPGRADE_NAMES.map(itemKeyOfName),
  ...PROJECTILES_UPGRADE_NAMES.map(itemKeyOfName),
  RETRO_QUIVER_ITEM,
]);

const USEFUL_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>(itemsClassed('useful'));

export { PROGRESSION_ITEMS, USEFUL_ITEMS };
