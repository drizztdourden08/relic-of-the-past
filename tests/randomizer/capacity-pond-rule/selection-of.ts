/* @layer tests @kind helper */
import { pondSettingForMode } from '@shared/randomizer/world/pond/pond-mode-switch';
import { LEGACY_POND_SETTING } from '@shared/randomizer/world/pond/pond-profile-defaults';
import type { CapacityPondSelection } from '@shared/randomizer/world/capacity-pond';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
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
