/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const capacityBonusBaseKeyOf = (family: CapacityFamilyId): string => `capacity_${family}_bonus_step`;

export { capacityBonusBaseKeyOf };
