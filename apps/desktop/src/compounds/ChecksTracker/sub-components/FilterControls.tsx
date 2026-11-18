/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { itemFilterOptions, NESTED_PATHS, TAG_PATHS } from '../ChecksTracker.constants';
import type { FilterControlsProps } from '../ChecksTracker.type';
import { statusOptions, viewModeOptions } from './TrackerFilters.constants';
import { TrackerLogicToggles } from './TrackerLogicToggles';

const FilterControls = (props: FilterControlsProps) => {
  const t = useT();
  const {
    filter, onFilterChange, grouping, viewMode, onViewModeChange, run, onToggleTags, onToggleGroupConfig,
  } = props;
  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';

  return (
    <Box className="tracker-filters__controls">
      <SegmentedControl size="sm" value={viewMode} options={viewModeOptions(t)} onChange={onViewModeChange} />
      <SegmentedControl
        size="sm"
        value={statusFilter}
        options={statusOptions(t)}
        onChange={(value) => onFilterChange({ ...filter, statusFilter: value })}
      />
      <SegmentedControl
        size="sm"
        value={itemFilter}
        options={itemFilterOptions(t)}
        onChange={(value) => onFilterChange({ ...filter, itemFilter: value })}
      />
      <Button
        variant="tertiary"
        size="sm"
        active={filter.activeFacets.length > 0}
        icon={<Icon path={{ d: TAG_PATHS }} size={12} />}
        onClick={onToggleTags}
      >
        {filter.activeFacets.length > 0
          ? t('compounds:tracker.controls.tags-count', { count: filter.activeFacets.length })
          : t('compounds:tracker.controls.tags')}
      </Button>
      <Button
        variant="tertiary"
        size="sm"
        active={grouping.length > 0}
        icon={<Icon path={{ d: NESTED_PATHS }} size={12} />}
        onClick={onToggleGroupConfig}
      >
        {grouping.length > 0
          ? t('compounds:tracker.controls.group-count', { count: grouping.length })
          : t('compounds:tracker.controls.group')}
      </Button>
      <TrackerLogicToggles filter={filter} onFilterChange={onFilterChange} run={run} />
    </Box>
  );
};

export { FilterControls };
