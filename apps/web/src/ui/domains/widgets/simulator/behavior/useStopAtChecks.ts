/* @layer renderer-widgets @kind hook */
/**
 * Data + filter state for the stop-at-check picker. Mirrors the checks widget's
 * snapshot pipeline (tracker statuses over the vanilla logic preset) and reuses
 * the shared `filterChecks` helper + `FilterState` so the picker offers the same
 * search / tag / item / status filtering the checks widget does.
 */
import { useState, useEffect, useMemo } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import type { CheckStatus } from '@shared/game/logic/eval';
import { resolveRules } from '@shared/game/logic/resolver';
import { VANILLA_CONFIG } from '@shared/game/data/presets';
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
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);

  const statuses = useMemo<Map<string, CheckStatus>>(
    () => computeTrackerSnapshot(effectiveInventory, completed, checkRecords, resolvedLogic.connections, resolvedLogic.checkOverrides),
    [effectiveInventory, completed, checkRecords, resolvedLogic],
  );

  const checks = useMemo<CheckRecord[]>(
    () => filterChecks(checkRecords, filter, statuses),
    [checkRecords, filter, statuses],
  );

  return { filter, setFilter, checks, statuses };
};

export { useStopAtChecks };
