/**
 * ChecksWidgetContent — Content for the Checks widget.
 * Wraps TrackerSummary + TrackerFilters + TrackerGroupTree with data subscriptions.
 */
import { useState, useEffect, useMemo } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules, VANILLA_CONFIG } from '@shared/game/logic/presets';
import { ALL_CHECKS } from '@shared/game/checks';
import { getCheckTags } from '@shared/game/checks/tags';
import type { GroupDimension, FilterState } from '@shared/game/checks/grouping';
import { buildGroupTree, filterChecks } from '@shared/game/checks/grouping';
import {
  onInventoryChanged, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks,
} from '../../../lib/game';
import { TrackerSummary } from '../../views/TrackerView/TrackerSummary';
import { TrackerFilters, type ViewMode } from '../../views/TrackerView/TrackerFilters';
import { TrackerGroupTree } from '../../views/TrackerView/TrackerGroupTree';

export function ChecksWidgetContent() {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(() => getCompletedChecks());
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [grouping, setGrouping] = useState<GroupDimension[]>(['world', 'dungeon']);
  const [filter, setFilter] = useState<FilterState>({ searchQuery: '', activeTags: [], tagMode: 'any' });

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);

  const tagMap = useMemo(() => getCheckTags(ALL_CHECKS), []);
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);
  const snapshot = useMemo(
    () => computeTrackerSnapshot(effectiveInventory, completedChecks, ALL_CHECKS, resolvedLogic.connections, resolvedLogic.regionRules, resolvedLogic.checkRules),
    [effectiveInventory, completedChecks, resolvedLogic],
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

  const filteredChecks = useMemo(() => filterChecks(ALL_CHECKS, filter, tagMap, snapshot), [filter, tagMap, snapshot]);
  const groupTree = useMemo(() => buildGroupTree(filteredChecks, snapshot, grouping, tagMap), [filteredChecks, snapshot, grouping, tagMap]);

  return (
    <div className="checks-widget-content">
      <TrackerSummary {...stats} />
      <TrackerFilters
        filter={filter}
        onFilterChange={setFilter}
        grouping={grouping}
        onGroupingChange={setGrouping}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {(filter.searchQuery || filter.activeTags.length > 0 || (filter.itemFilter && filter.itemFilter !== 'all') || (filter.statusFilter && filter.statusFilter !== 'all')) && (
        <div className="tracker-view__filtered-stats">
          Showing {groupTree.stats.total} checks:
          <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
          <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
          <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
        </div>
      )}
      <div className="tracker-view__checks">
        <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
      </div>
    </div>
  );
}
