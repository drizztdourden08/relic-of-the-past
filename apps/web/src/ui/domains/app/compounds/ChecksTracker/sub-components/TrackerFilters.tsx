/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Status, Box, Button, Icon, IconButton, SegmentedControl, TextInput } from '@drizztdourden08/tessera/primitives';
import {
  CLOSED_PANELS, FUNNEL_PATHS, ITEM_FILTER_OPTIONS, NESTED_PATHS, SEARCH_PATHS, SHOW_MODE_OPTIONS, TAG_PATHS,
} from '../ChecksTracker.constants';
import type { TrackerFiltersProps, TrackerPanels } from '../ChecksTracker.type';
import { activeLogicToggles } from '../behavior/active-logic-toggles';
import { TrackerFilterPanels } from './TrackerFilterPanels';
import { STATUS_OPTIONS, VIEW_MODE_OPTIONS } from './TrackerFilters.constants';
import { TrackerLogicToggles } from './TrackerLogicToggles';
import '../ChecksTracker.css';

const TrackerFilters = (props: TrackerFiltersProps) => {
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange, dimensions, panels, onPanelsChange, run } = props;
  const [localPanels, setLocalPanels] = useState<TrackerPanels>(CLOSED_PANELS);
  const open = panels ?? localPanels;
  const setOpen = (next: TrackerPanels) => {
    if (panels && onPanelsChange) onPanelsChange(next);
    else setLocalPanels(next);
  };
  const { filters: showFilters, groupConfig: showGroupConfig, tags: showTagFilter } = open;

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';
  const activeCount = (itemFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + activeLogicToggles(filter, run)
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
            onClick={() => setOpen({ ...open, filters: !showFilters })}
          >
            <Icon paths={FUNNEL_PATHS} size={13} />
          </IconButton>
          {activeCount > 0 && (
            <Status className="tracker-filters__count" tone="warning">{activeCount}</Status>
          )}
        </Box>
      </Box>

      <Box className="tracker-filters__show-mode">
        <SegmentedControl
          value={filter.showMode ?? 'items'}
          options={SHOW_MODE_OPTIONS}
          onChange={(value) => onFilterChange({ ...filter, showMode: value })}
        />
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
            onClick={() => setOpen({ ...open, tags: !showTagFilter })}
          >
            Tags{filter.activeFacets.length > 0 ? ` (${filter.activeFacets.length})` : ''}
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            active={grouping.length > 0}
            icon={<Icon paths={NESTED_PATHS} size={12} />}
            onClick={() => setOpen({ ...open, groupConfig: !showGroupConfig })}
          >
            Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
          </Button>
          <TrackerLogicToggles filter={filter} onFilterChange={onFilterChange} run={run} />
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
export type { TrackerPanels };
