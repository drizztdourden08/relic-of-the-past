/* @layer shared-game @kind logic */
import { capacityFamilyOfItemName } from '@rotp/game-data';
import { itemKeyName } from '../display-names/item-key-name';
import { familyOfDungeonItem } from '../dungeon-items/dungeon-item-modes';
import { WALLET } from '../capacity/capacity-family';
import { startTierOf } from '../capacity/family-plan';
import { MAX_PRICE } from '../rules/priced-entries';
import { walletRungFor } from '../state-helpers-capacity';
import { PROGRESSION_ITEMS } from './item-classes.constants';
import type { ItemKey } from '../item-ids';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const isProgressionUnder = (profile: CapacityProfile) => {
  const walletIsProgression = startTierOf(WALLET, profile.wallet) < walletRungFor(MAX_PRICE);
  return (item: ItemKey): boolean => {
    if (PROGRESSION_ITEMS.has(item)) return true;
    const dungeonFamily = familyOfDungeonItem(item);
    if (dungeonFamily !== undefined) return dungeonFamily === 'smallKey' || dungeonFamily === 'bigKey';
    const family = capacityFamilyOfItemName(itemKeyName(item));
    return family === 'wallet' ? walletIsProgression : family !== undefined;
  };
};

export { isProgressionUnder };
