/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { canExtendMagic, canShootArrows, canUseBombs, hasMeleeWeapon } from '../state-helpers';
import { BOMBS_PER_ENEMY, BYRNA_ENEMY_LIMIT } from './state-helpers-world.constants';
import type { CollectionState } from '../collection-state.type';

const canKillMostThings = (state: CollectionState, enemies = 5): boolean =>
  hasMeleeWeapon(state)
  || state.has(ITEM.caneOfSomaria)
  || (state.has(ITEM.caneOfByrna) && (enemies < BYRNA_ENEMY_LIMIT || canExtendMagic(state)))
  || canShootArrows(state)
  || state.has(ITEM.fireRod)
  || canUseBombs(state, enemies * BOMBS_PER_ENEMY);

export { canKillMostThings };
