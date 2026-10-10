/* @layer tests @kind helper */
import { pondSettingForMode, LEGACY_POND_SETTING } from '@rotp/randomizer';
import type { CapacityPondSelection } from '@rotp/randomizer';
import type { SelectionParams } from './capacity-pond-rule.type';
import { profileOf } from './profile-of';

const selectionOf = (params: SelectionParams): CapacityPondSelection => {
  const { enabled, pondMode, explosives, projectiles, retroBow = false } = params;
  return {
    enabled,
    capacity: profileOf(explosives, projectiles),
    pond: pondSettingForMode(pondMode, LEGACY_POND_SETTING),
    retroBow,
  };
};

export { selectionOf };
