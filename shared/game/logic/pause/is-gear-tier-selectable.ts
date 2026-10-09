/* @layer shared-game @kind logic */
import type { GearLadderKind } from './pause.type';
import { clampGearTier } from './clamp-gear-tier';
import { maxGearTier } from './max-gear-tier';

const isGearTierSelectable = (kind: GearLadderKind, tier: number, ownedMax: number): boolean =>
  tier >= 0 && tier <= maxGearTier(kind) && tier <= clampGearTier(kind, ownedMax);

export { isGearTierSelectable };
