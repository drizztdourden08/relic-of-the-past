/* @layer shared-game @kind logic */
import { isPinnedUnderRetro } from '../capacity/retro-projectiles';
import { CAPACITY_POND_NOTES } from './capacity-pond-notes.constants';
import { NO_FORCED_FAMILIES, POND_FED_FAMILIES } from './capacity-pond.constants';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

const forcedFamiliesOf = (selection: CapacityPondSelection): ReadonlyMap<CapacityFamilyId, string> => {
  if (!selection.enabled || !selection.retroBow) return NO_FORCED_FAMILIES;
  return new Map(POND_FED_FAMILIES
    .filter((family) => isPinnedUnderRetro(family, selection.retroBow))
    .map((family) => [family, CAPACITY_POND_NOTES.retroProjectiles]));
};

export { forcedFamiliesOf };
