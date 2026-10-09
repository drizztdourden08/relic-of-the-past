/* @layer shared-game @kind logic */
import { USEFUL_ITEMS } from '../item-classes.constants';
import { isProgressionUnder } from '../progression-class';
import { PRIZE_ITEMS } from '../prize-items.constants';
import { PROMOTED_HEART_CONTAINERS } from './build-item-pool.constants';
import type { ItemKey } from '../../item-ids';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { ItemPool } from '../item-pool.type';

const classifiedPoolOf = (
  pool: readonly ItemKey[], capacity: CapacityProfile,
  dungeonItems: ReadonlyMap<string, readonly ItemKey[]>, uncleWeapon: ItemKey | undefined,
): ItemPool => {
  const isProgression = isProgressionUnder(capacity);
  return {
    pool,
    progression: pool.filter(isProgression),
    useful: pool.filter((item) => USEFUL_ITEMS.has(item)),
    filler: pool.filter((item) => !isProgression(item) && !USEFUL_ITEMS.has(item)),
    ...(uncleWeapon !== undefined ? { uncleWeapon } : {}),
    promotedHeartContainers: PROMOTED_HEART_CONTAINERS,
    dungeonItems,
    prizes: PRIZE_ITEMS,
    startInventory: [],
  };
};

export { classifiedPoolOf };
