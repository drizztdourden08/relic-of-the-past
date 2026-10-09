/* @layer renderer-lib @kind constants */
import type { CapacityFamilyId } from '@shared/randomizer/world/capacity';
import { pluralStep } from './pluralStep';

const FAMILY_LABEL: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'Bombs',
  projectiles: 'Arrows',
  meter: 'Magic Meter',
  wallet: 'Wallet (Rupees)',
};

const JUMP_LABEL: Readonly<Record<CapacityFamilyId, (jump: number) => string>> = {
  explosives: (jump) => pluralStep(jump, 'tier'),
  projectiles: (jump) => pluralStep(jump, 'tier'),
  meter: (jump) => pluralStep(jump, 'tier'),
  wallet: (jump) => `+${jump * 100}`,
};

const VANILLA_NOTE: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'sold at the pond',
  projectiles: 'sold at the pond',
  meter: 'given by the bat',
  wallet: 'no upgrades',
};

const PROGRESSIVE_NOTE = 'pickups climb in this order';

export { FAMILY_LABEL, JUMP_LABEL, PROGRESSIVE_NOTE, VANILLA_NOTE };
