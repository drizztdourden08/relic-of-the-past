/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState } from 'react';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CLOSED_PANELS, showModeOptions } from '../ChecksTracker.constants';
import type { TrackerFiltersProps, TrackerPanels } from '../ChecksTracker.type';
import { activeFilterCount } from '../behavior/active-filter-count';
import { FilterControls } from './FilterControls';
import { FilterSearch } from './FilterSearch';
import { TrackerFilterPanels } from './TrackerFilterPanels';
import './TrackerFilters.css';

const TrackerFilters = (props: TrackerFiltersProps) => {
  const t = useT();
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange, dimensions, panels, onPanelsChange, run } = props;
  const [localPanels, setLocalPanels] = useState<TrackerPanels>(CLOSED_PANELS);
  const open = panels ?? localPanels;
  const setOpen = (next: TrackerPanels) => {
    if (panels && onPanelsChange) onPanelsChange(next);
    else setLocalPanels(next);
  };
  const { filters: showFilters, groupConfig: showGroupConfig, tags: showTagFilter } = open;

  return (
    <Box className="tracker-filters">
      <FilterSearch
        filter={filter}
        onFilterChange={onFilterChange}
        activeCount={activeFilterCount(filter, grouping, run)}
        filtersOpen={showFilters}
        onToggleFilters={() => setOpen({ ...open, filters: !showFilters })}
      />

      <Box className="tracker-filters__show-mode">
        <SegmentedControl
          value={filter.showMode ?? 'items'}
          options={showModeOptions(t)}
          onChange={(value) => onFilterChange({ ...filter, showMode: value })}
        />
      </Box>

      {showFilters && (
        <>
          <FilterControls
            filter={filter}
            onFilterChange={onFilterChange}
            grouping={grouping}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            run={run}
            onToggleTags={() => setOpen({ ...open, tags: !showTagFilter })}
            onToggleGroupConfig={() => setOpen({ ...open, groupConfig: !showGroupConfig })}
          />
          <TrackerFilterPanels
            filter={filter}
            onFilterChange={onFilterChange}
            grouping={grouping}
            onGroupingChange={onGroupingChange}
            showTagFilter={showTagFilter}
            showGroupConfig={showGroupConfig}
            dimensions={dimensions}
          />
        </>
      )}
    </Box>
  );
};

export { TrackerFilters };
