/* @layer shared-game @kind logic */
import { CAPACITY_FAMILY_IDS } from '../capacity-upgrade-names.constants';
import type { CapacityFamilyId } from '../capacity-family.type';
import { PROGRESSIVE_CAPACITY_VIRT_FIRST } from './capacity-progressive-receive-id.constants';

const progressiveCapacityReceiveIdOf = (family: CapacityFamilyId): number =>
  PROGRESSIVE_CAPACITY_VIRT_FIRST + CAPACITY_FAMILY_IDS.indexOf(family);

export { progressiveCapacityReceiveIdOf };
