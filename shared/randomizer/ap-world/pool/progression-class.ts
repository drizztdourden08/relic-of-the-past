/* @layer shared-game @kind logic */
/**
 * Progression classification under a capacity profile. The reference table
 * (item-classes.data.ts) already lists the counted families' upgrades and
 * the two meter levels as progression; the wallet items join them whenever
 * the wallet starts below the rung the priciest gate needs
 * (rules/tables/prices.data.ts), because until that rung is reached a
 * priced check is locked exactly like a check behind a missing key. A
 * vanilla wallet starts above every price, so nothing is promoted there and
 * the reference partition is unchanged. A progressive item is classed by
 * its family exactly like the fixed-jump items of that family.
 *
 * The dungeon keys answer here too: Items.py classes every `Small Key (…)`
 * and `Big Key (…)` as progression and every `Map (…)` / `Compass (…)` as
 * filler. They only ever reach the global pool when their family's shuffle
 * mode takes them out of the dungeon prefill (dungeon-items/), so under the
 * baseline this branch is never taken and the reference partition stands.
 */
import { capacityFamilyOfItemName } from '@shared/game/data/capacity-upgrade-item';
import { familyOfDungeonItem } from '../dungeon-items/dungeon-item-modes';
import { WALLET } from '../capacity/capacity-family';
import { startTierOf } from '../capacity/family-plan';
import { MAX_PRICE } from '../rules/tables/prices.data';
import { walletRungFor } from '../state-helpers-capacity';
import { PROGRESSION_ITEMS } from './item-classes.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const isProgressionUnder = (profile: CapacityProfile) => {
  const walletIsProgression = startTierOf(WALLET, profile.wallet) < walletRungFor(MAX_PRICE);
  return (itemName: string): boolean => {
    if (PROGRESSION_ITEMS.has(itemName)) return true;
    const dungeonFamily = familyOfDungeonItem(itemName);
    if (dungeonFamily !== undefined) return dungeonFamily === 'smallKey' || dungeonFamily === 'bigKey';
    const family = capacityFamilyOfItemName(itemName);
    return family === 'wallet' ? walletIsProgression : family !== undefined;
  };
};

export { isProgressionUnder };
