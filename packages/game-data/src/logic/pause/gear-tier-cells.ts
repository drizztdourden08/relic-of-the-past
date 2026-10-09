/* @layer shared-game @kind logic */
import { getItem } from '../../data';
import { spriteFilename } from '../queries/item-sprites';
import type { GearLadderKind, GearTierCell } from './pause.type';
import { BARE_TIER_SPRITES, TIER_RECORDS } from './gear-tiers.constants';
import { clampGearTier } from './clamp-gear-tier';
import { gearTierCount } from './gear-tier-count';

const spriteForTier = (kind: GearLadderKind, tier: number): string => {
  const recordId = TIER_RECORDS[kind][tier];
  if (!recordId) return BARE_TIER_SPRITES[kind];
  return spriteFilename(getItem(recordId).spriteId) ?? BARE_TIER_SPRITES[kind];
};

const gearTierCells = (kind: GearLadderKind, ownedMax: number): GearTierCell[] => {
  const highest = clampGearTier(kind, ownedMax);
  return Array.from({ length: gearTierCount(kind) }, (_, tier) => ({
    kind,
    tier,
    sprite: spriteForTier(kind, tier),
    owned: tier <= highest,
  }));
};

export { gearTierCells };
