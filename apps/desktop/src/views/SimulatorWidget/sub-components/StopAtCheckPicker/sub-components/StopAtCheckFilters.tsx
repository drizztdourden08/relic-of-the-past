/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Disclosure, SearchInput, SegmentedControl, TagPicker } from '@drizztdourden08/tessera/primitives';
import { FACET_GROUPS, itemFilters, statusFilters } from '../StopAtCheckPicker.constants';
import type { StopAtCheckFiltersProps } from '../StopAtCheckPicker.type';

const StopAtCheckFilters = (props: StopAtCheckFiltersProps) => {
  const { filter, onFilterChange } = props;
  const t = useT();
  const tagCount = filter.activeFacets.length;

  return (
    <Box className="stop-picker__filters">
      <SearchInput
        className="stop-picker__search"
        placeholder={t('views-simulator:picker.search')}
        value={filter.searchQuery}
        onChange={(searchQuery) => onFilterChange({ ...filter, searchQuery })}
      />

      <Box className="stop-picker__filter-row">
        <SegmentedControl
          size="sm"
          value={filter.itemFilter ?? 'all'}
          options={itemFilters(t)}
          onChange={(itemFilter) => onFilterChange({ ...filter, itemFilter })}
        />
        <SegmentedControl
          size="sm"
          value={filter.statusFilter ?? 'all'}
          options={statusFilters(t)}
          onChange={(statusFilter) => onFilterChange({ ...filter, statusFilter })}
        />
      </Box>

      <Disclosure size="sm" summary={tagCount > 0 ? t('views-simulator:picker.tags.count', { count: tagCount }) : t('views-simulator:picker.tags')}>
        <Box className="stop-picker__tags">
          <TagPicker
            size="sm"
            aria-label={t('views-simulator:picker.tags')}
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
