/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids';
import type { ItemKey } from '../item-ids';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';

const START_FAMILY_OF_WEAPON: ReadonlyMap<ItemKey, CapacityFamilyId> = new Map<ItemKey, CapacityFamilyId>([
  [ITEM.bombs10, 'explosives'],
  [ITEM.progressiveBow, 'projectiles'],
  [ITEM.bow, 'projectiles'],
  [ITEM.fireRod, 'meter'],
  [ITEM.caneOfSomaria, 'meter'],
  [ITEM.caneOfByrna, 'meter'],
]);

export { START_FAMILY_OF_WEAPON };
