/* @layer renderer-components @kind component */
import { useState } from 'react';
import type {
  FilterState, GroupDimension, GroupDimensionDef, StatusFilter,
} from '@shared/game/logic/queries/check-grouping';
import { Box, TextInput, Button } from '@ds/primitives';
import { TrackerFilterPanels } from './TrackerFilterPanels';
import '../ChecksTracker.css';

type ViewMode = 'compact' | 'detailed' | 'visual';

/** Which disclosure panels are open. Small enough to travel as one value, which
 *  keeps the controlled form to a single prop pair. */
interface TrackerPanels {
  filters: boolean;
  groupConfig: boolean;
  tags: boolean;
}

const CLOSED_PANELS: TrackerPanels = { filters: false, groupConfig: false, tags: false };

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Grouping axes the config panel offers. Defaults to the base catalog. */
  dimensions?: readonly GroupDimensionDef[];
  /**
   * Controlled disclosure state. Supply both and the caller owns which panels are
   * open, so they survive this component being unmounted. Omit both and the panels
   * keep their own state, closed on every mount.
   */
  panels?: TrackerPanels;
  onPanelsChange?: (next: TrackerPanels) => void;
}

const VIEW_MODES: { mode: ViewMode; icon: string; title: string }[] = [
  { mode: 'compact', icon: '≡', title: 'Compact' },
  { mode: 'detailed', icon: '☰', title: 'Detailed' },
  { mode: 'visual', icon: '⊞', title: 'Visual' },
];

const ITEM_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Non-rewards' },
] as const;

const STATUS_FILTERS = [
  { value: 'all', label: 'All', cls: '' },
  { value: 'reachable', label: '●', cls: 'tracker-filters__status-btn--reachable' },
  { value: 'completed', label: '✓', cls: 'tracker-filters__status-btn--completed' },
  { value: 'blocked', label: '✕', cls: 'tracker-filters__status-btn--blocked' },
] as const;

const TrackerFilters = (props: TrackerFiltersProps) => {
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange, dimensions, panels, onPanelsChange } = props;
  const [localPanels, setLocalPanels] = useState<TrackerPanels>(CLOSED_PANELS);
  const open = panels ?? localPanels;
  const setOpen = (next: TrackerPanels) => {
    if (panels && onPanelsChange) onPanelsChange(next);
    else setLocalPanels(next);
  };
  const { filters: showFilters, groupConfig: showGroupConfig, tags: showTagFilter } = open;

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';
  const activeCount = (itemFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)
    + (filter.activeFacets.length > 0 ? 1 : 0) + (grouping.length > 0 ? 1 : 0);

  return (
    <Box className="tracker-filters">
      <Box className="tracker-filters__search">
        <TextInput
          type="text"
          className="tracker-filters__input"
          placeholder="Search checks..."
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
        />
        <Button
          variant="bare"
          className={`tracker-filters__toggle ${showFilters ? 'tracker-filters__toggle--active' : ''}`}
          onClick={() => setOpen({ ...open, filters: !showFilters })}
          title="Filters & view options"
        >
          ⚑{activeCount > 0 ? ` ${activeCount}` : ''}
        </Button>
      </Box>

      {showFilters && (
        <Box className="tracker-filters__controls">
          <Box className="tracker-filters__view-modes">
            {VIEW_MODES.map(({ mode, icon, title }) => (
              <Button
                variant="bare"
                key={mode}
                title={title}
                className={`tracker-filters__mode-btn ${viewMode === mode ? 'tracker-filters__mode-btn--active' : ''}`}
                onClick={() => onViewModeChange(mode)}
              >
                {icon}
              </Button>
            ))}
          </Box>

          <Box className="tracker-filters__view-modes">
            {ITEM_FILTERS.map(opt => (
              <Button
                variant="bare"
                key={opt.value}
                className={`tracker-filters__mode-btn ${itemFilter === opt.value ? 'tracker-filters__mode-btn--active' : ''}`}
                onClick={() => onFilterChange({ ...filter, itemFilter: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </Box>

          <Box className="tracker-filters__status-group">
            {STATUS_FILTERS.map(opt => (
              <Button
                variant="bare"
                key={opt.value}
                className={`tracker-filters__status-btn ${opt.cls} ${statusFilter === opt.value ? 'tracker-filters__status-btn--active' : ''}`}
                onClick={() => onFilterChange({ ...filter, statusFilter: opt.value as StatusFilter })}
                title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
              >
                {opt.label}
              </Button>
            ))}
          </Box>

          <Button
            variant="bare"
            className={`tracker-filters__btn ${filter.activeFacets.length > 0 ? 'tracker-filters__btn--active' : ''}`}
            onClick={() => setOpen({ ...open, tags: !showTagFilter })}
          >
            Tags{filter.activeFacets.length > 0 ? ` (${filter.activeFacets.length})` : ''}
          </Button>

          <Button
            variant="bare"
            className={`tracker-filters__btn ${grouping.length > 0 ? 'tracker-filters__btn--active' : ''}`}
            onClick={() => setOpen({ ...open, groupConfig: !showGroupConfig })}
          >
            Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
          </Button>
        </Box>
      )}

      {showFilters && (
        <TrackerFilterPanels
          filter={filter}
          onFilterChange={onFilterChange}
          grouping={grouping}
          onGroupingChange={onGroupingChange}
          showTagFilter={showTagFilter}
          showGroupConfig={showGroupConfig}
          dimensions={dimensions}
        />
      )}
    </Box>
  );
};

export { TrackerFilters };
export { CLOSED_PANELS };
export type { TrackerPanels, ViewMode };
