/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '@rotp/game-data';

const capacityBonusKeyOf = (family: CapacityFamilyId): string => `capacity_${family}_bonus`;

export { capacityBonusKeyOf };
