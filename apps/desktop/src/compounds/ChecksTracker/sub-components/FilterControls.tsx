/* @layer renderer-components @kind component */
import { Box, Button, Icon, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ITEM_FILTER_OPTIONS, NESTED_PATHS, TAG_PATHS } from '../ChecksTracker.constants';
import type { FilterControlsProps } from '../ChecksTracker.type';
import { STATUS_OPTIONS, VIEW_MODE_OPTIONS } from './TrackerFilters.constants';
import { TrackerLogicToggles } from './TrackerLogicToggles';

const FilterControls = (props: FilterControlsProps) => {
  const {
    filter, onFilterChange, grouping, viewMode, onViewModeChange, run, onToggleTags, onToggleGroupConfig,
  } = props;
  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';

  return (
    <Box className="tracker-filters__controls">
      <SegmentedControl size="sm" value={viewMode} options={VIEW_MODE_OPTIONS} onChange={onViewModeChange} />
      <SegmentedControl
        size="sm"
        value={statusFilter}
        options={STATUS_OPTIONS}
        onChange={(value) => onFilterChange({ ...filter, statusFilter: value })}
      />
      <SegmentedControl
        size="sm"
        value={itemFilter}
        options={ITEM_FILTER_OPTIONS}
        onChange={(value) => onFilterChange({ ...filter, itemFilter: value })}
      />
      <Button
        variant="tertiary"
        size="sm"
        active={filter.activeFacets.length > 0}
        icon={<Icon path={{ d: TAG_PATHS }} size={12} />}
        onClick={onToggleTags}
      >
        Tags{filter.activeFacets.length > 0 ? ` (${filter.activeFacets.length})` : ''}
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={grouping.length > 0}
        icon={<Icon path={{ d: NESTED_PATHS }} size={12} />}
        onClick={onToggleGroupConfig}
      >
        Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
      </Button>
      <TrackerLogicToggles filter={filter} onFilterChange={onFilterChange} run={run} />
    </Box>
  );
};

export { FilterControls };
