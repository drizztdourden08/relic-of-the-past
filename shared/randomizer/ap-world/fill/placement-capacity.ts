/* @layer shared-game @kind logic */
/**
 * The capacity profile a persisted placement was generated with. Placements
 * written before the profile existed carry only the old boolean, which
 * stood for the legacy Custom shape (capacity-profile-defaults.ts). The
 * progressive switch is read the same way: absent means the fixed-jump
 * items the placement was actually generated with.
 */
import { legacyCapacityProfile } from '../capacity/capacity-profile-defaults';
import { LEGACY_CAPACITY_BONUS } from '../capacity/bonus/capacity-bonus.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { CapacityBonusSetting } from '../capacity/bonus/capacity-bonus.type';
import type { ApPlacementStats } from './ap-placement.type';

const capacityProfileOfStats = (stats: ApPlacementStats): CapacityProfile =>
  stats.capacity ?? legacyCapacityProfile(stats.capacityShuffle === true);

const capacityProgressiveOfStats = (stats: ApPlacementStats): boolean => stats.capacityProgressive === true;

/** Absent means the baselines: the goods a pickup handed over before the rows existed. */
const capacityBonusOfStats = (stats: ApPlacementStats): CapacityBonusSetting => stats.capacityBonus ?? LEGACY_CAPACITY_BONUS;

export { capacityBonusOfStats, capacityProfileOfStats, capacityProgressiveOfStats };
