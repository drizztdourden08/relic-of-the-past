/* @layer shared-game @kind logic */
import type { CapacityFamily } from '../capacity-family';
import type { FamilySetting } from '../capacity-profile.type';

const startTierOf = (capacityFamily: CapacityFamily, setting: FamilySetting | undefined): number =>
  setting?.mode === 'custom' ? capacityFamily.indexOf(setting.start) : capacityFamily.vanillaRung;

export { startTierOf };
