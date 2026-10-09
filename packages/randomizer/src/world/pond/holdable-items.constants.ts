/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids';
import type { ItemCategory } from '@rotp/game-data';

const HOLDABLE_CATEGORIES: ReadonlySet<ItemCategory> =
  new Set<ItemCategory>(['equipment', 'weapon', 'medallion', 'crystal']);

const UNHELD_ITEMS: ReadonlyMap<string, string> = new Map([
  [ITEM.shovel, 'shares its inventory byte with the Flute, which replaces it'],
  [ITEM.flute, 'shares its inventory byte with the Shovel, which replaces it'],
  [ITEM.activatedFlute, 'shares the Flute and Shovel byte, so a Shovel found later replaces it'],
  [ITEM.progressiveOcarina, 'its rungs share the Flute and Shovel byte, so a Shovel found later replaces them'],
  [ITEM.mushroom, 'the witch takes it, and it shares its byte with the Magic Powder'],
  [ITEM.magicPowder, 'shares its inventory byte with the Mushroom'],
  [ITEM.blueBoomerang, 'shares its inventory byte with the Red Boomerang, which replaces it'],
  [ITEM.redBoomerang, 'shares its inventory byte with the Blue Boomerang, which replaces it'],
]);

export { HOLDABLE_CATEGORIES, UNHELD_ITEMS };
