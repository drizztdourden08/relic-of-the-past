/* @layer renderer-widgets @kind hook */
/**
 * Data + filter state for the stop-at-check picker. Runs the checks widget's own snapshot
 * pipeline (tracker/tracker-statuses.ts, over the placement where nothing moved) and reuses the
 * shared `filterChecks` helper + `FilterState` so the picker offers the same search / tag / item
 * / status filtering the checks widget does.
 */
import { useState, useEffect, useMemo } from 'react';
import type { CheckStatus } from '@shared/game/logic';
import { normalPlacement } from '@app/lib/game/tracker/normal-placement-ref';
import { trackerStatuses } from '@app/lib/game/tracker/tracker-statuses';
import { find } from '@shared/game/data';
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import { filterChecks } from '@shared/game/logic/queries/check-grouping';
import type { FilterState } from '@shared/game/logic/queries/check-grouping';
import {
  onInventoryChanged, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks,
} from '@app/lib/game';

const EMPTY_FILTER: FilterState = {
  searchQuery: '',
  activeFacets: [],
  tagMode: 'any',
  itemFilter: 'all',
  statusFilter: 'all',
};

const useStopAtChecks = () => {
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completed, setCompleted] = useState<Set<CheckId>>(() => getCompletedChecks());

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((c) => setCompleted(new Set(c))), []);

  const checkRecords = useMemo(() => find('check', () => true), []);

  const statuses = useMemo<Map<string, CheckStatus>>(
    () => trackerStatuses({
      placement: normalPlacement(),
      checks: checkRecords,
      inventory,
      completed,
    }),
    [inventory, completed, checkRecords],
  );

  const checks = useMemo<CheckRecord[]>(
    () => filterChecks(checkRecords, filter, statuses),
    [checkRecords, filter, statuses],
  );

  return { filter, setFilter, checks, statuses };
};

export { useStopAtChecks };
