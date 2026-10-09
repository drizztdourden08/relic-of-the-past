/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { canExtendMagic, canUseBombs, hasMeleeWeapon } from '../state-helpers';
import { BYRNA_ENEMY_LIMIT } from './state-helpers-world.constants';
import type { CollectionState } from '../collection-state.type';

const canKillStandardStart = (state: CollectionState, enemies = 5): boolean =>
  hasMeleeWeapon(state)
  || state.has(ITEM.caneOfSomaria)
  || (state.has(ITEM.caneOfByrna) && (enemies < BYRNA_ENEMY_LIMIT || canExtendMagic(state)))
  || state.hasAny([ITEM.bow, ITEM.progressiveBow])
  || state.has(ITEM.fireRod)
  || canUseBombs(state, enemies);

export { canKillStandardStart };
