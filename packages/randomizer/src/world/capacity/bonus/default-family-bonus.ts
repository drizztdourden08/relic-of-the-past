/* @layer shared-game @kind logic */
import { DEFAULT_CAPACITY_BONUS } from './capacity-bonus.constants';
import type { CapacityFamilyId } from '@rotp/game-data';
import type { FamilyBonus } from './capacity-bonus.type';

const defaultFamilyBonus = (family: CapacityFamilyId): FamilyBonus => DEFAULT_CAPACITY_BONUS[family];

export { defaultFamilyBonus };
