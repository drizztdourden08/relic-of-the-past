/* @layer tests @kind helper */
import type { Holding } from '@shared/randomizer/world/collection-state';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { World } from '@shared/randomizer/world/world.type';

const scatterPlacements = (world: World, items: readonly Holding[], random: () => number): void => {
  world.placedItems.clear();
  for (const key of world.locationsByKey.keys()) {
    if (random() < 0.5) world.placedItems.set(key, items[Math.floor(random() * items.length)] as ItemKey);
  }
};

export { scatterPlacements };
