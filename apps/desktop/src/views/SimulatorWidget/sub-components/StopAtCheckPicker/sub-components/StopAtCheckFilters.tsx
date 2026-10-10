/* @layer renderer-widgets @kind component */
import { Box, Disclosure, SearchInput, SegmentedControl, TagPicker } from '@drizztdourden08/tessera/primitives';
import { FACET_GROUPS, ITEM_FILTERS, STATUS_FILTERS } from '../StopAtCheckPicker.constants';
import type { StopAtCheckFiltersProps } from '../StopAtCheckPicker.type';

const StopAtCheckFilters = (props: StopAtCheckFiltersProps) => {
  const { filter, onFilterChange } = props;
  const tagCount = filter.activeFacets.length;

  return (
    <Box className="stop-picker__filters">
      <SearchInput
        className="stop-picker__search"
        placeholder="Search checks..."
        value={filter.searchQuery}
        onChange={(searchQuery) => onFilterChange({ ...filter, searchQuery })}
      />

      <Box className="stop-picker__filter-row">
        <SegmentedControl
          size="sm"
          value={filter.itemFilter ?? 'all'}
          options={ITEM_FILTERS}
          onChange={(itemFilter) => onFilterChange({ ...filter, itemFilter })}
        />
        <SegmentedControl
          size="sm"
          value={filter.statusFilter ?? 'all'}
          options={STATUS_FILTERS}
          onChange={(statusFilter) => onFilterChange({ ...filter, statusFilter })}
        />
      </Box>

      <Disclosure size="sm" summary={tagCount > 0 ? `Tags (${tagCount})` : 'Tags'}>
        <Box className="stop-picker__tags">
          <TagPicker
            size="sm"
            aria-label="Tags"
            value={filter.activeFacets}
            groups={FACET_GROUPS}
            onChange={(activeFacets) => onFilterChange({ ...filter, activeFacets })}
          />
        </Box>
      </Disclosure>
    </Box>
  );
};

export { StopAtCheckFilters };
