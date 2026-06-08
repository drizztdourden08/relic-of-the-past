/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback } from 'react';
import { ALL_CHECKS } from '@shared/game/checks';
import type { GroupDimension, FilterState } from '@shared/game/checks/grouping';
import { buildGroupTree, filterChecks } from '@shared/game/checks/grouping';
import { TrackerSummary } from './sub-components/TrackerSummary';
import { TrackerInventory } from './sub-components/TrackerInventory';
import { TrackerFilters, type ViewMode } from './sub-components/TrackerFilters';
import { TrackerGroupTree } from './sub-components/TrackerGroupTree';
import './TrackerView.css';
import type { PanelSettings, TrackerLayoutSettings, TrackerViewProps } from './types';
import { useTrackerState } from './useTrackerState';
import { useDrag } from './useDrag';
import { loadLayout, saveLayout } from './layout';
import { PanelHeader } from './PanelHeader';
import { TrackerPanel } from './TrackerPanel';

const TrackerView = (props: TrackerViewProps) => {
  const { visible, onClose } = props;
  const [layout, setLayoutRaw] = useState<TrackerLayoutSettings>(loadLayout);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [grouping, setGrouping] = useState<GroupDimension[]>(['world', 'dungeon']);
  const [filter, setFilter] = useState<FilterState>({ searchQuery: '', activeTags: [], tagMode: 'any' });

  const { inventory, snapshot, tagMap, stats } = useTrackerState();

  const setLayout = useCallback((updater: (prev: TrackerLayoutSettings) => TrackerLayoutSettings) => {
    setLayoutRaw(prev => {
      const next = updater(prev);
      saveLayout(next);
      return next;
    });
  }, []);

  const setInventoryPanel = useCallback((updater: (p: PanelSettings) => PanelSettings) => {
    setLayout(l => ({ ...l, inventory: updater(l.inventory) }));
  }, [setLayout]);

  const setChecksPanel = useCallback((updater: (p: PanelSettings) => PanelSettings) => {
    setLayout(l => ({ ...l, checks: updater(l.checks) }));
  }, [setLayout]);

  const inventoryDrag = useDrag(
    { x: layout.inventory.x, y: layout.inventory.y },
    useCallback((x, y) => setInventoryPanel(s => ({ ...s, x, y })), [setInventoryPanel]),
  );
  const checksDrag = useDrag(
    { x: layout.checks.x, y: layout.checks.y },
    useCallback((x, y) => setChecksPanel(s => ({ ...s, x, y })), [setChecksPanel]),
  );

  const filteredChecks = useMemo(() => filterChecks(ALL_CHECKS, filter, tagMap, snapshot), [filter, tagMap, snapshot]);
  const groupTree = useMemo(() => buildGroupTree(filteredChecks, snapshot, grouping, tagMap), [filteredChecks, snapshot, grouping, tagMap]);

  if (!visible) return null;

  const { combined } = layout;
  const hasActiveFilter = filter.searchQuery || filter.activeTags.length > 0 || (filter.statusFilter && filter.statusFilter !== 'all');

  const filterStats = hasActiveFilter && (
    <div className="tracker-view__filtered-stats">
      Showing {groupTree.stats.total} checks:
      <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
      <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
      <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
    </div>
  );

  const filtersBlock = (
    <TrackerFilters
      filter={filter}
      onFilterChange={setFilter}
      grouping={grouping}
      onGroupingChange={setGrouping}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );

  const checksBlock = (
    <div className="tracker-view__checks">
      <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
    </div>
  );

  if (combined) {
    const ps = layout.inventory;
    return (
      <TrackerPanel panelSettings={ps} onDragStart={ps.mode === 'floating' ? inventoryDrag : undefined}>
        <PanelHeader
          title="Tracker"
          panelSettings={ps}
          onSettingsChange={setInventoryPanel}
          onClose={onClose}
          showPopOut
          onPopOut={() => setLayout(l => ({ ...l, combined: false }))}
          onMouseDown={ps.mode === 'floating' ? inventoryDrag : undefined}
        />
        <TrackerInventory inventory={inventory} />
        <TrackerSummary {...stats} />
        {filtersBlock}
        {filterStats}
        {checksBlock}
      </TrackerPanel>
    );
  }

  return (
    <>
      <TrackerPanel panelSettings={layout.inventory} className="tracker-panel--compact">
        <PanelHeader
          title="Inventory"
          panelSettings={layout.inventory}
          onSettingsChange={setInventoryPanel}
          onClose={onClose}
          onDock={() => setLayout(l => ({ ...l, combined: true }))}
          onMouseDown={layout.inventory.mode === 'floating' ? inventoryDrag : undefined}
        />
        <TrackerInventory inventory={inventory} />
      </TrackerPanel>

      <TrackerPanel panelSettings={layout.checks}>
        <PanelHeader
          title="Checks"
          panelSettings={layout.checks}
          onSettingsChange={setChecksPanel}
          onClose={onClose}
          onDock={() => setLayout(l => ({ ...l, combined: true }))}
          onMouseDown={layout.checks.mode === 'floating' ? checksDrag : undefined}
        />
        <TrackerSummary {...stats} />
        {filtersBlock}
        {filterStats}
        {checksBlock}
      </TrackerPanel>
    </>
  );
};

export { TrackerView };
