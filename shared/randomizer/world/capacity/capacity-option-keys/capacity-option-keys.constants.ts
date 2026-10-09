/* @layer shared-game @kind constants */
import type { CapacityFamilyId } from '../capacity-profile.type';
import type { CapacityField } from './capacity-option-keys.type';

const CAPACITY_FIELDS_OF: Readonly<Record<CapacityFamilyId, readonly CapacityField[]>> = {
  explosives: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
  projectiles: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
  meter: ['mode', 'start', 'max', 'count'],
  wallet: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
};

const CAPACITY_KEY_PATTERN = /^capacity_(explosives|projectiles|meter|wallet)_(mode|start|max|count|curve|jumps)$/;

const CAPACITY_ENABLED_KEY = 'capacity_upgrades_enabled';

const CAPACITY_PROGRESSIVE_KEY = 'capacity_progressive';

export { CAPACITY_ENABLED_KEY, CAPACITY_FIELDS_OF, CAPACITY_KEY_PATTERN, CAPACITY_PROGRESSIVE_KEY };
