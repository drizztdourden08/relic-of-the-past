/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { METER_LEVEL_LABELS } from '../../world/capacity/capacity-ladders.constants';
import { familyById } from '../../world/capacity/capacity-family';
import type { CapacityFamilyId } from '@rotp/game-data';

const capacityRungText = (family: CapacityFamilyId, rung: number): string =>
  (family === 'meter' ? itemAt(METER_LEVEL_LABELS, rung) :String(familyById(family).ladder[rung]));

export { capacityRungText };
