/* @layer shared-game @kind logic */
import { evaluateRequirement } from './evaluate-requirement';
import { isCheckPlaceReached } from './check-place';
import type { CheckId } from '../data';
import type { CheckStatus } from './check-status.type';
import type { RecordStatusParams } from './record-statuses.type';

const computeRecordStatuses = (params: RecordStatusParams): Map<CheckId, CheckStatus> => {
  const { inventory, completedChecks, checks, reachableScreens, checkOverrides = {} } = params;
  const statuses = new Map<CheckId, CheckStatus>();

  for (const check of checks) {
    if (completedChecks.has(check.id)) {
      statuses.set(check.id, 'completed');
      continue;
    }
    if (!isCheckPlaceReached(check, reachableScreens)) {
      statuses.set(check.id, 'blocked');
      continue;
    }
    const requirement = checkOverrides[check.id] ?? check.requirements;
    const met = requirement === undefined || evaluateRequirement(requirement, inventory, completedChecks);
    statuses.set(check.id, met ? 'reachable' : 'blocked');
  }
  return statuses;
};

export { computeRecordStatuses };
