/* @layer shared-game @kind constants */
import { customSetting } from './custom-setting';
import type { CapacityProfile } from '../capacity-profile.type';

const REFERENCE_CAPACITY_PROFILE: CapacityProfile = {
  explosives: { mode: 'vanilla' },
  projectiles: { mode: 'vanilla' },
  meter: { mode: 'vanilla-in-pool' },
  wallet: { mode: 'vanilla' },
};

const VANILLA_CAPACITY_PROFILE: CapacityProfile = {
  explosives: { mode: 'vanilla' },
  projectiles: { mode: 'vanilla' },
  meter: { mode: 'vanilla' },
  wallet: { mode: 'vanilla' },
};

const DEFAULT_CAPACITY_PROFILE: CapacityProfile = {
  explosives: customSetting(0, 50, 7),
  projectiles: customSetting(0, 70, 7),
  meter: customSetting(0, 3, 3),
  wallet: { mode: 'custom', start: 0, max: 9999, count: 8, shape: { curve: 'geometric' } },
};

export { DEFAULT_CAPACITY_PROFILE, REFERENCE_CAPACITY_PROFILE, VANILLA_CAPACITY_PROFILE };
