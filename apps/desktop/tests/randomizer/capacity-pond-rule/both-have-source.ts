/* @layer tests @kind helper */
import type { CapacityProfile, FamilySetting, PondSetting } from '@rotp/randomizer';

const hasSource = (setting: FamilySetting, pond: PondSetting): boolean =>
  (setting.mode === 'vanilla' ? pond.mode === 'capacity' : true);

const bothHaveSource = (capacity: CapacityProfile, pond: PondSetting, retroBow = false): boolean =>
  hasSource(capacity.explosives, pond)
  && (retroBow ? capacity.projectiles.mode === 'vanilla' : hasSource(capacity.projectiles, pond));

export { bothHaveSource };
