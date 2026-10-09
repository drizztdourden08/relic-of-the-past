/* @layer shared-game @kind constants */
import { CAPACITY_FAMILY_IDS, CAPACITY_PROGRESSIVE_NAMES } from '../capacity-upgrade-names.constants';
import type { CapacityFamilyId } from '../capacity-family.type';

const FAMILY_BY_PROGRESSIVE_NAME: ReadonlyMap<string, CapacityFamilyId> = new Map(
  CAPACITY_FAMILY_IDS.map((family): [string, CapacityFamilyId] => [CAPACITY_PROGRESSIVE_NAMES[family], family]),
);

export { FAMILY_BY_PROGRESSIVE_NAME };
