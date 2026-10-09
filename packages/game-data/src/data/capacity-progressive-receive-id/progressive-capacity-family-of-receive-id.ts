/* @layer shared-game @kind logic */
import { CAPACITY_FAMILY_IDS } from '../capacity-upgrade-names.constants';
import type { CapacityFamilyId } from '../capacity-family.type';
import { PROGRESSIVE_CAPACITY_VIRT_FIRST } from './capacity-progressive-receive-id.constants';
import { isProgressiveCapacityReceiveId } from './is-progressive-capacity-receive-id';

const progressiveCapacityFamilyOfReceiveId = (id: number): CapacityFamilyId | undefined =>
  (isProgressiveCapacityReceiveId(id) ? CAPACITY_FAMILY_IDS[id - PROGRESSIVE_CAPACITY_VIRT_FIRST] : undefined);

export { progressiveCapacityFamilyOfReceiveId };
