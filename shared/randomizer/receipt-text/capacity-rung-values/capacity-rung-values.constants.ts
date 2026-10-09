/* @layer shared-game @kind constants */
import type { CapacityFamilyId } from '@rotp/game-data';

const GROWTH_VERB: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'swell',
  projectiles: 'fill out',
  meter: 'deepen',
  wallet: 'stretch',
};

const PLURAL_LABEL: ReadonlySet<CapacityFamilyId> = new Set(['projectiles']);

const VALUE_UNIT: Readonly<Partial<Record<CapacityFamilyId, string>>> = {
  wallet: ' rupees',
};

export { GROWTH_VERB, PLURAL_LABEL, VALUE_UNIT };
