/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { find } from '@shared/game/data';
import type { GroupDimension, FilterState } from '@shared/game/logic/queries/check-grouping';
import { buildGroupTree, filterChecks } from '@shared/game/logic/queries/check-grouping';
import { TrackerSummary } from './sub-components/TrackerSummary';
import { TrackerInventory } from './sub-components/TrackerInventory';
import { TrackerFilters, type ViewMode } from './sub-components/TrackerFilters';
import { TrackerGroupTree } from './sub-components/TrackerGroupTree';
import './TrackerView.css';
import type { PanelSettings, TrackerLayoutSettings, TrackerViewProps } from './TrackerView.type';
import { useTrackerState } from './behavior/useTrackerState';
import { useDrag } from './behavior/useDrag';
import { loadLayout, saveLayout } from './behavior/layout';
import { PanelHeader } from './sub-components/PanelHeader';
import { TrackerPanel } from './sub-components/TrackerPanel';

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

  const checks = useMemo(() => find('check', () => true), []);
  const filteredChecks = useMemo(() => filterChecks(checks, filter, tagMap, snapshot), [checks, filter, tagMap, snapshot]);
  const groupTree = useMemo(() => buildGroupTree(filteredChecks, snapshot, grouping, tagMap), [filteredChecks, snapshot, grouping, tagMap]);

  if (!visible) return null;

  const { combined } = layout;
  const hasActiveFilter = filter.searchQuery || filter.activeTags.length > 0 || (filter.statusFilter && filter.statusFilter !== 'all');

  const filterStats = hasActiveFilter && (
    <Box className="tracker-view__filtered-stats">
      Showing {groupTree.stats.total} checks:
      <Text className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</Text>,
      <Text className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</Text>,
      <Text className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</Text>
    </Box>
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
    <Box className="tracker-view__checks">
      <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
    </Box>
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
