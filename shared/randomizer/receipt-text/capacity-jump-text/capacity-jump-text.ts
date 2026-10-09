/* @layer shared-game @kind logic */
import { WALLET_STEP_RUPEES } from './capacity-jump-text.constants';
import type { CapacityFamilyId } from '@rotp/game-data';

const plural = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? '' : 's'}`;

const capacityJumpText = (family: CapacityFamilyId, jump: number): string => {
  if (family === 'wallet') return `${jump * WALLET_STEP_RUPEES} rupees`;
  if (family === 'meter') return plural(jump, 'level');
  return plural(jump, 'tier');
};

export { capacityJumpText };
