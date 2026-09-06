/* @layer shared-game @kind logic */
/**
 * The jump one capacity upgrade performs, as receipt text. A receipt shows the
 * JUMP and never a running total: collection order is route-dependent, so
 * "now 35" is true for one of the N! orders a seed can be walked in while
 * "2 tiers" is true in every one of them. The counted families' tier values
 * are uneven (the last tier is +10, the others +5), so a value label would
 * change meaning with position; a tier count does not. The wallet ladder is
 * uniform (100 rupees per step), so its jump is shown as rupees.
 */
import { familyById } from '../ap-world/capacity/capacity-family';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const WALLET_STEP_RUPEES = 100;

const plural = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? '' : 's'}`;

/** "2 tiers" · "1 level" · "500 rupees": the size of one upgrade item's jump. */
const capacityJumpText = (family: CapacityFamilyId, jump: number): string => {
  if (family === 'wallet') return `${jump * WALLET_STEP_RUPEES} rupees`;
  if (family === 'meter') return plural(jump, 'level');
  return plural(jump, 'tier');
};

/** The family's display label, from the capacity model (never a game name). */
const capacityFamilyLabel = (family: CapacityFamilyId): string => familyById(family).label;

export { capacityFamilyLabel, capacityJumpText };
