import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CheckDefinition } from '@shared/types/tracker';
import type { CheckStatus } from '@shared/lib/logic-eval';
import { computeTrackerSnapshot } from '@shared/lib/logic-eval';
import { ALL_CHECKS } from '@shared/data/checks';
import { ALL_CONNECTIONS } from '@shared/data/regions';
import { REGION_RULES, CHECK_RULES } from '@shared/data/logic';
import { getCheckTags } from '@shared/data/checks/tags';
import type { GroupDimension, FilterState } from '@shared/data/checks/grouping';
import { buildGroupTree, filterChecks } from '@shared/data/checks/grouping';
import {
  onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  getActiveProfileId,
} from '../../../lib/game';
import type { UnknownItemEntry } from '../../../lib/game';
import { TrackerSummary } from './TrackerSummary';
import { TrackerInventory } from './TrackerInventory';
import { TrackerFilters, type ViewMode } from './TrackerFilters';
import { TrackerGroupTree } from './TrackerGroupTree';
import './TrackerView.css';

interface TrackerViewProps {
  visible: boolean;
  onClose: () => void;
}

export function TrackerView({ visible, onClose }: TrackerViewProps) {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(() => getCompletedChecks());
  const [unknownItems, setUnknownItems] = useState<UnknownItemEntry[]>(() => getUnknownItems());
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [grouping, setGrouping] = useState<GroupDimension[]>(['world', 'dungeon']);
  const [filter, setFilter] = useState<FilterState>({ searchQuery: '', activeTags: [], tagMode: 'any' });

  // Load persisted unknown items on mount
  useEffect(() => {
    const profileId = getActiveProfileId();
    if (!profileId) return;
    window.api.loadTrackerState(profileId).then((state: any) => {
      if (state?.unknownItems?.length) {
        loadUnknownItems(state.unknownItems);
        setUnknownItems(state.unknownItems);
      }
    });
  }, []);

  useEffect(() => {
    return onInventoryChanged((inv) => setInventory(new Set(inv)));
  }, []);

  useEffect(() => {
    return onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks)));
  }, []);

  useEffect(() => {
    return onUnknownItem((items) => {
      setUnknownItems([...items]);
      const profileId = getActiveProfileId();
      if (profileId) {
        window.api.saveTrackerState(profileId, { unknownItems: items });
      }
    });
  }, []);

  // Pre-compute tag map
  const tagMap = useMemo(() => getCheckTags(ALL_CHECKS), []);

  const snapshot = useMemo(
    () => computeTrackerSnapshot(inventory, completedChecks, ALL_CHECKS, ALL_CONNECTIONS, REGION_RULES, CHECK_RULES),
    [inventory, completedChecks],
  );

  // Filter checks
  const filteredChecks = useMemo(
    () => filterChecks(ALL_CHECKS, filter, tagMap),
    [filter, tagMap],
  );

  // Build group tree from filtered checks
  const groupTree = useMemo(
    () => buildGroupTree(filteredChecks, snapshot, grouping, tagMap),
    [filteredChecks, snapshot, grouping, tagMap],
  );

  // Summary stats (from all checks, not filtered)
  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total: snapshot.size };
  }, [snapshot]);

  if (!visible) return null;

  return (
    <div className="tracker-view">
      <div className="tracker-view__header">
        <h2 className="tracker-view__title">Tracker</h2>
        <button className="tracker-view__close" onClick={onClose} aria-label="Close tracker">×</button>
      </div>

      {/* 1. Visual Inventory */}
      <TrackerInventory inventory={inventory} />

      {/* 2. Global goal / summary */}
      <TrackerSummary {...stats} />

      {/* 3. Filters, search, grouping, view modes */}
      <TrackerFilters
        filter={filter}
        onFilterChange={setFilter}
        grouping={grouping}
        onGroupingChange={setGrouping}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Filtered stats (only shown when filtering is active) */}
      {(filter.searchQuery || filter.activeTags.length > 0) && (
        <div className="tracker-view__filtered-stats">
          Showing {groupTree.stats.total} checks:
          <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
          <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
          <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
        </div>
      )}

      {/* 4. Grouped check tree */}
      <div className="tracker-view__checks">
        <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
      </div>
    </div>
  );
}
