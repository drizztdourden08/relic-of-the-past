/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { buildFillWorld, fillEligibleLocations } from '../../fill/fill-world';
import { fillOptionsFromSnapshot } from '../../fill/fill-options-from-snapshot';
import { fillerCountOf } from '../filler-count-of';
import { planItemsOf } from './plan-items-of';
import type { ItemKey } from '../../item-ids';
import type { DeliverableSets } from '../../fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { PoolAccounting } from '../pool.type';

const firstChoice = (choices: readonly ItemKey[]): ItemKey => itemAt(choices, 0);

const accountingOf = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, shopSeed = '',
): PoolAccounting => {
  const fillWorld = buildFillWorld(
    fillOptionsFromSnapshot(snapshot, deliverable, { pickWeapon: firstChoice }, shopSeed),
  );
  const { world, pool } = fillWorld;
  const dungeon = [...pool.dungeonItems.values()].reduce((sum, items) => sum + items.length, 0);
  const allLocations = [...world.locationsByKey.values()];
  const spots = allLocations.filter((location) => !location.prize);
  const planItems = planItemsOf(fillWorld);
  return {
    locations: world.locationsByKey.size,
    spots: spots.length,
    open: fillEligibleLocations(fillWorld).length,
    items: pool.pool.length + dungeon,
    fixed: spots.filter((location) => world.placedItems.has(location.key)).length,
    prizes: allLocations.filter((location) => location.prize).length,
    lockedVanilla: fillWorld.lockedVanilla.size,
    filler: fillerCountOf(pool.pool),
    upgrades: pool.pool.filter((item) => planItems.has(item)).length,
  };
};

export { accountingOf };
