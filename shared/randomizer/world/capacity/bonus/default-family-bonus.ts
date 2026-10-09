/* @layer shared-game @kind logic */
import { DEFAULT_CAPACITY_BONUS } from './capacity-bonus.data';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
import type { FamilyBonus } from './capacity-bonus.type';

const defaultFamilyBonus = (family: CapacityFamilyId): FamilyBonus => DEFAULT_CAPACITY_BONUS[family];

export { defaultFamilyBonus };
