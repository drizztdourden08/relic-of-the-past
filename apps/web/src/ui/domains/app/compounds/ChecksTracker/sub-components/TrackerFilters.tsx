/* @layer renderer-components @kind component */
/**
 * The tracker's filter bar: a search box that is always there, and a drawer of
 * the rest. Every control is a design-system one, so the tracker picks up the
 * app's segmented-control and button treatment instead of restating it.
 */
import { useState } from 'react';
import type {
  FilterState, GroupDimension, GroupDimensionDef, ItemFilter, StatusFilter,
} from '@shared/game/logic/queries/check-grouping';
import { Badge, Box, Button, Icon, IconButton, SegmentedControl, TextInput } from '@ds/primitives';
import type { SegmentOption } from '@ds/primitives';
import {
  FUNNEL_PATHS, GRID_PATHS, LIST_DETAIL_PATHS, LIST_PATHS, NESTED_PATHS, SEARCH_PATHS, TAG_PATHS,
} from '../ChecksTracker.constants';
import type { ViewMode } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';
import { TrackerFilterPanels } from './TrackerFilterPanels';
import '../ChecksTracker.css';

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Grouping axes the config panel offers. Defaults to the base catalog. */
  dimensions?: readonly GroupDimensionDef[];
}

const VIEW_MODE_OPTIONS: SegmentOption<ViewMode>[] = [
  { value: 'compact', label: <Icon paths={LIST_PATHS} size={13} />, title: 'Compact rows' },
  { value: 'detailed', label: <Icon paths={LIST_DETAIL_PATHS} size={13} />, title: 'Rows with items' },
  { value: 'visual', label: <Icon paths={GRID_PATHS} size={13} />, title: 'Item cards' },
];

const ITEM_FILTER_OPTIONS: SegmentOption<ItemFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Non-rewards' },
];

const STATUS_OPTIONS: SegmentOption<StatusFilter>[] = [
  { value: 'all', label: 'All', title: 'Every status' },
  { value: 'completed', label: <CheckStatusIcon status="completed" />, title: 'Taken' },
  { value: 'reachable', label: <CheckStatusIcon status="reachable" />, title: 'Available' },
  { value: 'blocked', label: <CheckStatusIcon status="blocked" />, title: 'Left' },
];

const TrackerFilters = (props: TrackerFiltersProps) => {
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange, dimensions } = props;
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupConfig, setShowGroupConfig] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';
  const activeCount = (itemFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)
    + (filter.activeFacets.length > 0 ? 1 : 0) + (grouping.length > 0 ? 1 : 0);

  return (
    <Box className="tracker-filters">
      <Box className="tracker-filters__search">
        <Icon className="tracker-filters__search-icon" paths={SEARCH_PATHS} size={12} />
        <TextInput
          type="text"
          className="tracker-filters__input"
          placeholder="Search checks..."
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
          aria-label="Search checks"
        />
        <Box className="tracker-filters__toggle">
          <IconButton
            variant="ghost"
            size="sm"
            active={showFilters}
            label="Filters and view options"
            title="Filters and view options"
            onClick={() => setShowFilters(v => !v)}
          >
            <Icon paths={FUNNEL_PATHS} size={13} />
          </IconButton>
          {activeCount > 0 && (
            <Badge className="tracker-filters__count" variant="warning">{activeCount}</Badge>
          )}
        </Box>
      </Box>

      {showFilters && (
        <Box className="tracker-filters__controls">
          <SegmentedControl value={viewMode} options={VIEW_MODE_OPTIONS} onChange={onViewModeChange} />
          <SegmentedControl
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(value) => onFilterChange({ ...filter, statusFilter: value })}
          />
          <SegmentedControl
            value={itemFilter}
            options={ITEM_FILTER_OPTIONS}
            onChange={(value) => onFilterChange({ ...filter, itemFilter: value })}
          />
          <Button
            variant="tertiary"
            size="sm"
            active={filter.activeFacets.length > 0}
            icon={<Icon paths={TAG_PATHS} size={12} />}
            onClick={() => setShowTagFilter(!showTagFilter)}
          >
            Tags{filter.activeFacets.length > 0 ? ` (${filter.activeFacets.length})` : ''}
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            active={grouping.length > 0}
            icon={<Icon paths={NESTED_PATHS} size={12} />}
            onClick={() => setShowGroupConfig(!showGroupConfig)}
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
