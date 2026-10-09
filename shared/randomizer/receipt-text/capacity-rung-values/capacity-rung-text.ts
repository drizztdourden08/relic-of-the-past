/* @layer shared-game @kind logic */
import { METER_LEVEL_LABELS } from '../../world/capacity/capacity-ladders.data';
import { familyById } from '../../world/capacity/capacity-family';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const capacityRungText = (family: CapacityFamilyId, rung: number): string =>
  (family === 'meter' ? METER_LEVEL_LABELS[rung] : String(familyById(family).ladder[rung]));

export { capacityRungText };
