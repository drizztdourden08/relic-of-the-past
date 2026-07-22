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
import { resolveRules, VANILLA_CONFIG } from '@shared/game/logic/presets';
import { ALL_CHECKS } from '@shared/game/checks';
import { getCheckTags } from '@shared/game/checks/tags';
import { filterChecks } from '@shared/game/checks/grouping';
import type { FilterState } from '@shared/game/checks/grouping';
import type { CheckDefinition } from '@shared/game/types';
import {
  onInventoryChanged, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks,
} from '@app/lib/game';

const EMPTY_FILTER: FilterState = {
  searchQuery: '',
  activeTags: [],
  tagMode: 'any',
  itemFilter: 'all',
  statusFilter: 'all',
};

const useStopAtChecks = () => {
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedChecks());

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((c) => setCompleted(new Set(c))), []);

  const tagMap = useMemo(() => getCheckTags(ALL_CHECKS), []);
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);

  const statuses = useMemo<Map<string, CheckStatus>>(
    () => computeTrackerSnapshot(effectiveInventory, completed, ALL_CHECKS, resolvedLogic.connections, resolvedLogic.screenRules, resolvedLogic.checkRules),
    [effectiveInventory, completed, resolvedLogic],
  );

  const checks = useMemo<CheckDefinition[]>(
    () => filterChecks(ALL_CHECKS, filter, tagMap, statuses),
    [filter, tagMap, statuses],
  );

  return { filter, setFilter, checks, statuses };
};

export { useStopAtChecks };
