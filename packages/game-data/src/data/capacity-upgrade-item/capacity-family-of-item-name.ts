/* @layer shared-game @kind logic */
import { progressiveCapacityFamilyOf } from '../capacity-progressive-item';
import type { CapacityFamilyId } from '../capacity-family.type';
import { ITEM_BY_NAME } from './capacity-upgrade-item.constants';

const capacityFamilyOfItemName = (itemName: string): CapacityFamilyId | undefined =>
  ITEM_BY_NAME.get(itemName)?.family ?? progressiveCapacityFamilyOf(itemName);

export { capacityFamilyOfItemName };
