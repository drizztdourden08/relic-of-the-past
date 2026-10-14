/* @layer renderer-components @kind component */
import { Badge, Box, Icon, IconButton, SearchInput } from '@drizztdourden08/tessera/primitives';
import { FUNNEL_PATHS } from '../ChecksTracker.constants';
import type { FilterSearchProps } from '../ChecksTracker.type';

const FilterSearch = ({ filter, onFilterChange, activeCount, filtersOpen, onToggleFilters }: FilterSearchProps) => (
  <Box className="tracker-filters__search">
    <SearchInput
      className="tracker-filters__input"
      placeholder="Search checks..."
      value={filter.searchQuery}
      onChange={(searchQuery) => onFilterChange({ ...filter, searchQuery })}
      aria-label="Search checks"
    />
    <Badge value={activeCount} color="warning" label={`${activeCount} filters active`}>
      <IconButton
        variant="ghost"
        size="sm"
        active={filtersOpen}
        label="Filters and view options"
        title="Filters and view options"
        onClick={onToggleFilters}
      >
        <Icon path={{ d: FUNNEL_PATHS }} size={13} />
      </IconButton>
    </Badge>
  </Box>
);

export { FilterSearch };
