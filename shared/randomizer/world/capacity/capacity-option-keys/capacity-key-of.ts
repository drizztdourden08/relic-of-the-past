/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '../capacity-profile.type';
import type { CapacityField } from './capacity-option-keys.type';

const capacityKeyOf = (family: CapacityFamilyId, field: CapacityField): string => `capacity_${family}_${field}`;

export { capacityKeyOf };
