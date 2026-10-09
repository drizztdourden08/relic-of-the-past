/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '../capacity-family.type';
import { FAMILY_BY_PROGRESSIVE_NAME } from './capacity-progressive-item.constants';

const progressiveCapacityFamilyOf = (itemName: string): CapacityFamilyId | undefined =>
  FAMILY_BY_PROGRESSIVE_NAME.get(itemName);

export { progressiveCapacityFamilyOf };
