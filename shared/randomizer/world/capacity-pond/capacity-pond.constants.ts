/* @layer shared-game @kind constants */
import type { CapacityFamilyId, FamilySetting } from '../capacity/capacity-profile.type';
import type { PondMode } from '../pond/pond-profile.type';

const POND_FED_FAMILIES = ['explosives', 'projectiles'] as const;

const FORCED_POND_MODE: PondMode = 'vanilla-cost';

const IN_POOL_SETTING: FamilySetting = { mode: 'vanilla-in-pool' };

const VANILLA_SETTING: FamilySetting = { mode: 'vanilla' };

const NO_FORCED_FAMILIES: ReadonlyMap<CapacityFamilyId, string> = new Map();

const FED_FAMILY_LABEL: Readonly<Record<(typeof POND_FED_FAMILIES)[number], string>> = {
  explosives: 'Bomb',
  projectiles: 'Arrow',
};

export {
  FED_FAMILY_LABEL, FORCED_POND_MODE, IN_POOL_SETTING, NO_FORCED_FAMILIES, POND_FED_FAMILIES, VANILLA_SETTING,
};
