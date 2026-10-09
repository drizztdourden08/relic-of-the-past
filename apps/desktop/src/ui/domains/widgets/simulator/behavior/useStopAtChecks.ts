/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useMemo } from 'react';
import type { CheckStatus } from '@rotp/game-data';
import { normalPlacement } from '@app/lib/game/tracker/normal-placement-ref';
import { trackerStatuses } from '@app/lib/game/tracker/tracker-statuses';
import { find } from '@rotp/game-data';
import type { CheckId, CheckRecord, ItemId } from '@rotp/game-data';
import { filterChecks } from '@rotp/game-data';
import type { FilterState } from '@rotp/game-data';
import {
  onInventoryChanged, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks,
} from '@app/lib/game';
import { EMPTY_FILTER } from '../SimulatorWidget.constants';

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
