/* @layer shared-game @kind logic */
import { CAPACITY_SHOP } from '../capacity/capacity-shop.data';
import { familySettingOf } from './family-setting-of';
import { tierReached } from './tier-reached';
import { walletCapacity } from './wallet-capacity';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { CollectionState } from '../collection-state.type';

const capacityShopOpen = (state: CollectionState): boolean =>
  state.canReachRegion(CAPACITY_SHOP.region) && walletCapacity(state) >= CAPACITY_SHOP.price;

const countedCapacity = (state: CollectionState, capacityFamily: CapacityFamily): number => {
  const setting = familySettingOf(state, capacityFamily);
  const { ladder, vanillaRung } = capacityFamily;
  if (setting.mode === 'vanilla') {
    return capacityShopOpen(state) ? ladder[ladder.length - 1] : ladder[vanillaRung];
  }
  return ladder[tierReached(state, capacityFamily, setting)];
};

export { countedCapacity };
