/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '@rotp/game-data';

const capacityBonusBaseKeyOf = (family: CapacityFamilyId): string => `capacity_${family}_bonus_step`;

export { capacityBonusBaseKeyOf };
