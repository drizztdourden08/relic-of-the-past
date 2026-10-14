/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import { checkIdOfLocation } from '../../world/location-record';
import { detectionOf, withProgressBaseline } from '../check-detection';
import { isLockedVanilla } from '../scope-lock';
import { planItemLabel } from '../plan-item-label';
import { targetLocalIdOf } from '../plan-target-id';
import { classifyCheck } from './classify-check';
import { classifyScoped } from './classify-scoped';
import { lockedVanillaRow } from './locked-vanilla-row';
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';
import type { ScopeFlags } from '../scope-lock';
import type { PlanEntry, PlanError } from '../physical-plan.type';

const classifyLocation = (
  location: LocationKey, item: ItemKey, flags: ScopeFlags,
): PlanEntry | PlanError => {
  const checkId = checkIdOfLocation(location);
  const detection = checkId !== undefined
    ? withProgressBaseline(detectionOf(checkId), flags.capacityStartTiers?.get(location))
    : null;
  const detectionField = detection !== null ? { detection } : {};

  if (isLockedVanilla(location, flags)) return lockedVanillaRow(location, item, flags, { checkId, detection });
  const targetLocalId = targetLocalIdOf(item);
  if (targetLocalId === undefined) {
    return { location, item, reason: `assigned item is unresolvable: ${planItemLabel(item)}` };
  }
  const scoped = classifyScoped({ location, item, flags, targetLocalId, checkId, detectionField });
  if (scoped !== null) return scoped;
  if (checkId === undefined) {
    return { location, item, reason: 'no check record for this location' };
  }
  return classifyCheck({
    location, item, checkId, check: getCheck(checkId), detection, detectionField, targetLocalId,
  });
};

export { classifyLocation };
