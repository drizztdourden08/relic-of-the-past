/* @layer shared-game @kind logic */
import { PROGRESSIVE_CAPACITY_VIRT_FIRST, PROGRESSIVE_CAPACITY_VIRT_LAST } from './capacity-progressive-receive-id.constants';

const isProgressiveCapacityReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= PROGRESSIVE_CAPACITY_VIRT_FIRST && id <= PROGRESSIVE_CAPACITY_VIRT_LAST;

export { isProgressiveCapacityReceiveId };
