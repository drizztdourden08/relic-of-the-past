/* @layer shared-game @kind logic */
/**
 * The status of a row from the dataset's own record: is its place reached, and is what it asks for
 * met.
 *
 * Only the rows no world holds a location for come here, which is every event and the fairy rungs
 * no pond sells (tracker/tracker-statuses.ts). Where the player can BE is handed in, derived from
 * the one engine's regions (logic/regions/reachable-screens.ts), so this carries no graph and no
 * rules of its own.
 */
import { evaluateRequirement } from './evaluate-requirement';
import { isCheckPlaceReached } from './check-place';
import type { CheckId, CheckRecord, ItemId, Requirement } from '../data';
import type { CheckStatus } from './check-status.type';

interface RecordStatusParams {
  inventory: ReadonlySet<ItemId>;
  completedChecks: ReadonlySet<CheckId>;
  checks: readonly CheckRecord[];
  /** Where the player can stand, as dataset screen ids. */
  reachableScreens: ReadonlySet<string>;
  /** Rows whose requirement the file's own settings decide (logic/row-overrides.ts). */
  checkOverrides?: Partial<Record<CheckId, Requirement>>;
}

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
export type { RecordStatusParams };
