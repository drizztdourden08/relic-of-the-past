/* @layer shared-game @kind logic */
import { CAPACITY_UPGRADE_NAMES } from '../capacity-upgrade-names.data';
import type { CapacityFamilyId } from '../capacity-family.type';

const maxUpgradeJumpOf = (family: CapacityFamilyId): number => CAPACITY_UPGRADE_NAMES[family].length;

export { maxUpgradeJumpOf };
