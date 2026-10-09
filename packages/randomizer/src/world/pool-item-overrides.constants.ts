/* @layer shared-game @kind data */
import { ITEM } from './item-ids';
import type { CheckId, ItemId } from '@rotp/game-data';

const POOL_ITEM_OVERRIDES: Readonly<Partial<Record<CheckId, ItemId>>> = {
  'check-017': ITEM.progressiveSword,
  'check-039': ITEM.progressiveSword,
  'check-072': ITEM.progressiveSword,
  'check-266': ITEM.progressiveSword,
  'check-267': ITEM.progressiveBow,
  'check-021': ITEM.blueBoomerang,
  'check-022': ITEM.progressiveShield,
  'check-008': ITEM.progressiveOcarina,
  'check-121': ITEM.bossHeartContainer,
  'check-130': ITEM.bossHeartContainer,
  'check-140': ITEM.bossHeartContainer,
  'check-155': ITEM.bossHeartContainer,
  'check-166': ITEM.bossHeartContainer,
  'check-180': ITEM.bossHeartContainer,
  'check-191': ITEM.bossHeartContainer,
  'check-202': ITEM.bossHeartContainer,
  'check-215': ITEM.bossHeartContainer,
  'check-231': ITEM.bossHeartContainer,
  'check-126': ITEM.smallKeyDesertPalace,
  'check-135': ITEM.smallKeyTowerOfHera,
  'check-235': ITEM.smallKeyGanonsTower,
};

export { POOL_ITEM_OVERRIDES };
