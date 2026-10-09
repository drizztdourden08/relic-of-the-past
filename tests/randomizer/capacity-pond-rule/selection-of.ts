/* @layer tests @kind helper */
import { pondSettingForMode } from '@rotp/randomizer';
import { LEGACY_POND_SETTING } from '@rotp/randomizer';
import type { CapacityPondSelection } from '@rotp/randomizer';
import type { PondMode } from '@rotp/randomizer';
import type { FamilyMode } from './capacity-pond-rule.type';
import { profileOf } from './profile-of';

const selectionOf = (
  enabled: boolean, pondMode: PondMode, explosives: FamilyMode, projectiles: FamilyMode, retroBow = false,
): CapacityPondSelection => ({
  enabled,
  capacity: profileOf(explosives, projectiles),
  pond: pondSettingForMode(pondMode, LEGACY_POND_SETTING),
  retroBow,
});

export { selectionOf };
