/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useMemo } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules } from '@shared/game/logic/resolver';
import { VANILLA_CONFIG } from '@shared/game/data/presets';
import { find } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import { getCheckTags } from '@shared/game/logic/queries/check-tags';
import type { GroupDimension, FilterState } from '@shared/game/logic/queries/check-grouping';
import { buildGroupTree, filterChecks } from '@shared/game/logic/queries/check-grouping';
import {
  onInventoryChanged, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks,
} from '../../../../../lib/game';
import type { ViewMode } from '../../../app/views/TrackerView/sub-components/TrackerFilters';

const useChecksData = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [grouping, setGrouping] = useState<GroupDimension[]>(['world', 'dungeon']);
  const [filter, setFilter] = useState<FilterState>({ searchQuery: '', activeTags: [], tagMode: 'any' });

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);

  const checkRecords = useMemo(() => find('check', () => true), []);
  const tagMap = useMemo(() => getCheckTags(checkRecords), [checkRecords]);
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);
  const snapshot = useMemo(
    () => computeTrackerSnapshot(effectiveInventory, completedChecks, checkRecords, resolvedLogic.connections, resolvedLogic.checkOverrides),
    [effectiveInventory, completedChecks, checkRecords, resolvedLogic],
  );

  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total: snapshot.size };
  }, [snapshot]);

  const filteredChecks = useMemo(() => filterChecks(checkRecords, filter, tagMap, snapshot), [checkRecords, filter, tagMap, snapshot]);
  const groupTree = useMemo(() => buildGroupTree(filteredChecks, snapshot, grouping, tagMap), [filteredChecks, snapshot, grouping, tagMap]);

  return {
    viewMode, setViewMode,
    grouping, setGrouping,
    filter, setFilter,
    snapshot, stats, groupTree,
  };
};

export { useChecksData };
