/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { canShootArrows, canUseBombs, hasMeleeWeapon } from '../state-helpers';
import type { CollectionState } from '../collection-state.type';

const canActivateCrystalSwitch = (state: CollectionState): boolean =>
  hasMeleeWeapon(state)
  || canUseBombs(state)
  || canShootArrows(state)
  || state.hasAny([
    ITEM.hookshot, ITEM.caneOfSomaria, ITEM.caneOfByrna, ITEM.fireRod, ITEM.iceRod,
    ITEM.blueBoomerang, ITEM.redBoomerang,
  ]);

export { canActivateCrystalSwitch };
