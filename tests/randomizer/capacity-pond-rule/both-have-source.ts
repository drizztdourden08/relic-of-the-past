/* @layer tests @kind helper */
import type { CapacityProfile, FamilySetting } from '@shared/randomizer/world/capacity';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';

const hasSource = (setting: FamilySetting, pond: PondSetting): boolean =>
  (setting.mode === 'vanilla' ? pond.mode === 'capacity' : true);

const bothHaveSource = (capacity: CapacityProfile, pond: PondSetting, retroBow = false): boolean =>
  hasSource(capacity.explosives, pond)
  && (retroBow ? capacity.projectiles.mode === 'vanilla' : hasSource(capacity.projectiles, pond));

export { bothHaveSource };
