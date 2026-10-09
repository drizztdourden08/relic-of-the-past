/* @layer tests @kind helper */
import type { CapacityProfile } from '@rotp/randomizer';
import type { FamilyMode } from './capacity-pond-rule.type';
import { settingFor } from './setting-for';

const profileOf = (explosives: FamilyMode, projectiles: FamilyMode): CapacityProfile => ({
  explosives: settingFor(explosives, 10, 15),
  projectiles: settingFor(projectiles, 30, 35),
  meter: { mode: 'vanilla-in-pool' },
  wallet: { mode: 'vanilla' },
});

export { profileOf };
