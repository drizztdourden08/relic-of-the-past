/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Badge, Box, Icon, IconButton, SearchInput } from '@drizztdourden08/tessera/primitives';
import { FUNNEL_PATHS } from '../ChecksTracker.constants';
import type { FilterSearchProps } from '../ChecksTracker.type';

const FilterSearch = ({ filter, onFilterChange, activeCount, filtersOpen, onToggleFilters }: FilterSearchProps) => {
  const t = useT();
  const toggle = (
    <IconButton
      variant="ghost"
      size="sm"
      active={filtersOpen}
      label={t('compounds:tracker.search.filters')}
      title={t('compounds:tracker.search.filters')}
      onClick={onToggleFilters}
    >
      <Icon path={{ d: FUNNEL_PATHS }} size={13} />
    </IconButton>
  );
  return (
    <Box className="tracker-filters__search">
      <SearchInput
        className="tracker-filters__input"
        placeholder={t('compounds:tracker.search.placeholder')}
        value={filter.searchQuery}
        onChange={(searchQuery) => onFilterChange({ ...filter, searchQuery })}
        aria-label={t('compounds:tracker.search.label')}
      />
      <Badge value={activeCount} hideZero color="warning" label={t('compounds:tracker.search.active', { count: activeCount })}>
        {toggle}
      </Badge>
    </Box>
  );
};

export { FilterSearch };
