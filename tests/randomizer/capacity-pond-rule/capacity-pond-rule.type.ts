/* @layer tests @kind type */
import type { CapacityPondAuthority, CapacityPondSelection } from '@shared/randomizer/world/capacity-pond';
import type { FAMILY_MODES } from './capacity-pond-rule.constants';

type FamilyMode = (typeof FAMILY_MODES)[number];

type Combination = { selection: CapacityPondSelection; authority: CapacityPondAuthority };

export type { Combination, FamilyMode };
