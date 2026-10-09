/* @layer shared-game @kind logic */
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { FamilySetting } from '../capacity/capacity-profile.type';
import type { CollectionState } from '../collection-state.type';

const familySettingOf = (state: CollectionState, capacityFamily: CapacityFamily): FamilySetting =>
  (state.world.options.capacity ?? REFERENCE_CAPACITY_PROFILE)[capacityFamily.id];

export { familySettingOf };
