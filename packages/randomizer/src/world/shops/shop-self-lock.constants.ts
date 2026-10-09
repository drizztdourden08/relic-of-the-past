/* @layer shared-game @kind constants */
import { BOTTLE_ITEMS } from '../item-groups';
import type { ItemKey } from '../item-ids.data';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { ShopCountedCurrency } from './shop-price.type';

const BOTTLE_SET: ReadonlySet<ItemKey> = new Set<ItemKey>(BOTTLE_ITEMS);

const FAMILY_OF_CURRENCY: Readonly<Record<ShopCountedCurrency, CapacityFamilyId | undefined>> = {
  rupees: 'wallet',
  arrows: 'projectiles',
  bombs: 'explosives',
  hearts: undefined,
};

export { BOTTLE_SET, FAMILY_OF_CURRENCY };
