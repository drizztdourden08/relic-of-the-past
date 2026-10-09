/* @layer shared-game @kind types */
import type { CapacityFamilyId, CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondMode, PondSetting } from '../pond/pond-profile.type';
import type { POND_FED_FAMILIES } from './capacity-pond.constants';

interface CapacityPondSelection {
  enabled: boolean;
  capacity: CapacityProfile;
  pond: PondSetting;
  retroBow: boolean;
}

type CapacityPondAuthority = 'pond' | 'capacity' | CapacityFamilyId;

interface ReconciledCapacityPond extends CapacityPondSelection {
  notes: readonly string[];
  capacityEditable: boolean;
  pondEditable: boolean;
  pondModes: readonly PondMode[];
  forcedFamilies: ReadonlyMap<CapacityFamilyId, string>;
}

type PondFedFamily = (typeof POND_FED_FAMILIES)[number];

type PondDemand = 'legacy' | 'active' | undefined;

export type { CapacityPondAuthority, CapacityPondSelection, PondDemand, PondFedFamily, ReconciledCapacityPond };
