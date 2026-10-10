/* @layer tests @kind type */
import type { CapacityPondAuthority, CapacityPondSelection, PondMode } from '@rotp/randomizer';
import type { FAMILY_MODES } from './capacity-pond-rule.constants';

type FamilyMode = (typeof FAMILY_MODES)[number];

type Combination = { selection: CapacityPondSelection; authority: CapacityPondAuthority };

type SelectionParams = {
  enabled: boolean;
  pondMode: PondMode;
  explosives: FamilyMode;
  projectiles: FamilyMode;
  retroBow?: boolean;
};

export type { Combination, FamilyMode, SelectionParams };
