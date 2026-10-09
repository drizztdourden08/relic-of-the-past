/* @layer shared-game @kind logic */
import { CAPACITY_FIELDS_OF } from './capacity-option-keys.constants';
import type { CapacityFamilyId } from '../capacity-profile.type';
import type { CapacityField } from './capacity-option-keys.type';

const capacityFieldsOf = (family: CapacityFamilyId): readonly CapacityField[] => CAPACITY_FIELDS_OF[family];

export { capacityFieldsOf };
