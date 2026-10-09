/* @layer shared-game @kind logic */
import type { GearLadderKind } from './pause.type';
import { gearTierCount } from './gear-tier-count';

const maxGearTier = (kind: GearLadderKind): number => gearTierCount(kind) - 1;

export { maxGearTier };
