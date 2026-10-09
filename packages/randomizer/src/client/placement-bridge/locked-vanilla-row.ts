/* @layer bridge-wasm @kind logic */
import { PRIZE_LOCATIONS } from '../../world/scope-tables';
import { capabilityVanillaItemOf } from '../capability-vanilla-item';
import type { ItemKey } from '../../world/item-ids.data';
import type { LocationKey } from '../../world/location-key';
import type { CheckDetection } from '../check-detection';
import type { ScopeFlags } from '../scope-lock';
import type { PlanEntry, PlanError } from '../physical-plan.type';

const lockedVanillaRow = (
  location: LocationKey, item: ItemKey, flags: ScopeFlags,
  checkId: string | undefined, detection: CheckDetection | null,
): PlanEntry | PlanError => {
  const requiredVanilla = capabilityVanillaItemOf(location, flags);
  const placementPredatesLock = requiredVanilla !== undefined && item !== requiredVanilla;
  if (placementPredatesLock) {
    const reason = PRIZE_LOCATIONS.has(location)
      ? `this seed placed dungeon prizes, which are no longer shuffled. Recreate the profile (expected "${requiredVanilla}")`
      : 'no certified physical path but a shuffled item is placed here (stale placement, recreate the profile)';
    return { location, item, reason };
  }
  return {
    location, item, planClass: 'vanilla-locked',
    ...(checkId !== undefined ? { checkId } : {}),
    ...(detection !== null ? { detection } : {}),
  };
};

export { lockedVanillaRow };
