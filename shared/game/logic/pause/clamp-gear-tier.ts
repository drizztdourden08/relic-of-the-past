/* @layer shared-game @kind logic */
import type { GearLadderKind } from './pause.type';
import { maxGearTier } from './max-gear-tier';

const clampGearTier = (kind: GearLadderKind, tier: number): number =>
  Math.min(Math.max(Math.trunc(tier) || 0, 0), maxGearTier(kind));

export { clampGearTier };
