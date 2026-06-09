/* @layer renderer-components @kind component */
import { useState } from 'react';
import type { GroupDimension, StatusFilter, FilterState } from '@shared/game/checks/grouping';
import { Box, TextInput } from '../../../../../design-system/primitives';
import { TrackerFilterPanels } from './TrackerFilterPanels';
import '../TrackerView.css';

type ViewMode = 'compact' | 'detailed' | 'visual';

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange } = props;
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupConfig, setShowGroupConfig] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';
  const activeCount = (itemFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)
    + (filter.activeTags.length > 0 ? 1 : 0) + (grouping.length > 0 ? 1 : 0);

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
        <Box
          as="button"
          className={`tracker-filters__toggle ${showFilters ? 'tracker-filters__toggle--active' : ''}`}
          onClick={() => setShowFilters(v => !v)}
          title="Filters & view options"
        >
          ⚑{activeCount > 0 ? ` ${activeCount}` : ''}
        </Box>
      </Box>

      {showFilters && (
        <Box className="tracker-filters__controls">
          <Box className="tracker-filters__view-modes">
            {VIEW_MODES.map(({ mode, icon, title }) => (
              <Box
                as="button"
                key={mode}
                title={title}
                className={`tracker-filters__mode-btn ${viewMode === mode ? 'tracker-filters__mode-btn--active' : ''}`}
                onClick={() => onViewModeChange(mode)}
              >
                {icon}
              </Box>
            ))}
          </Box>

          <Box className="tracker-filters__view-modes">
            {ITEM_FILTERS.map(opt => (
              <Box
                as="button"
                key={opt.value}
                className={`tracker-filters__mode-btn ${itemFilter === opt.value ? 'tracker-filters__mode-btn--active' : ''}`}
                onClick={() => onFilterChange({ ...filter, itemFilter: opt.value })}
              >
                {opt.label}
              </Box>
            ))}
          </Box>

          <Box className="tracker-filters__status-group">
            {STATUS_FILTERS.map(opt => (
              <Box
                as="button"
                key={opt.value}
                className={`tracker-filters__status-btn ${opt.cls} ${statusFilter === opt.value ? 'tracker-filters__status-btn--active' : ''}`}
                onClick={() => onFilterChange({ ...filter, statusFilter: opt.value as StatusFilter })}
                title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
              >
                {opt.label}
              </Box>
            ))}
          </Box>

          <Box
            as="button"
            className={`tracker-filters__btn ${filter.activeTags.length > 0 ? 'tracker-filters__btn--active' : ''}`}
            onClick={() => setShowTagFilter(!showTagFilter)}
          >
            Tags{filter.activeTags.length > 0 ? ` (${filter.activeTags.length})` : ''}
          </Box>

          <Box
            as="button"
            className={`tracker-filters__btn ${grouping.length > 0 ? 'tracker-filters__btn--active' : ''}`}
            onClick={() => setShowGroupConfig(!showGroupConfig)}
          >
            Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
          </Box>
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
        />
      )}
    </Box>
  );
};

export { TrackerFilters };
export type { ViewMode };
