/* @layer shared-game @kind logic */
import type { CapacityFamily } from '../capacity-family';
import type { FamilySetting } from '../capacity-profile.type';

const maxTierOf = (capacityFamily: CapacityFamily, setting: FamilySetting | undefined): number =>
  setting?.mode === 'custom' ? capacityFamily.indexOf(setting.max) : capacityFamily.ladder.length - 1;

export { maxTierOf };
