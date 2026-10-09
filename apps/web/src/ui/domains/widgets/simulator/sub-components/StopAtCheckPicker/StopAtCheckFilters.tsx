/* @layer renderer-widgets @kind component */
import { useCallback, useState } from 'react';
import { Box, Button, TextInput } from '@ds/primitives';
import { CHECK_FACET_DEFS } from '@shared/game/logic/queries/check-grouping';
import { ITEM_FILTERS, STATUS_FILTERS, TAG_CATEGORIES } from './StopAtCheckPicker.constants';
import type { StopAtCheckFiltersProps } from './StopAtCheckPicker.type';

const StopAtCheckFilters = (props: StopAtCheckFiltersProps) => {
  const { filter, onFilterChange } = props;
  const [showTags, setShowTags] = useState(false);

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';

  const toggleFacet = useCallback((facetId: string) => {
    const activeFacets = filter.activeFacets.includes(facetId)
      ? filter.activeFacets.filter((f) => f !== facetId)
      : [...filter.activeFacets, facetId];
    onFilterChange({ ...filter, activeFacets });
  }, [filter, onFilterChange]);

  return (
    <Box className="stop-picker__filters">
      <TextInput
        type="text"
        className="stop-picker__search"
        placeholder="Search checks..."
        value={filter.searchQuery}
        onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
      />

      <Box className="stop-picker__filter-row">
        {ITEM_FILTERS.map((opt) => (
          <Button
            variant="bare"
            size="sm"
            key={opt.value}
            className={`stop-picker__chip ${itemFilter === opt.value ? 'stop-picker__chip--active' : ''}`}
            onClick={() => onFilterChange({ ...filter, itemFilter: opt.value })}
          >
            {opt.label}
          </Button>
        ))}
        <Box className="stop-picker__filter-spacer" />
        {STATUS_FILTERS.map((opt) => (
          <Button
            variant="bare"
            size="sm"
            key={opt.value}
            title={opt.title}
            className={`stop-picker__chip ${statusFilter === opt.value ? 'stop-picker__chip--active' : ''}`}
            onClick={() => onFilterChange({ ...filter, statusFilter: opt.value })}
          >
            {opt.label}
          </Button>
        ))}
      </Box>

      <Button
        variant="bare"
        size="sm"
        className={`stop-picker__chip ${filter.activeFacets.length > 0 ? 'stop-picker__chip--active' : ''}`}
        onClick={() => setShowTags((v) => !v)}
      >
        Tags{filter.activeFacets.length > 0 ? ` (${filter.activeFacets.length})` : ''}
      </Button>

      {showTags && (
        <Box className="stop-picker__tags">
          {TAG_CATEGORIES.map((cat) => (
            <Box key={cat} className="stop-picker__tag-group">
              {CHECK_FACET_DEFS.filter((t) => t.category === cat).map((t) => (
                <Button
                  variant="bare"
                  size="sm"
                  key={t.id}
                  className={`stop-picker__chip ${filter.activeFacets.includes(t.id) ? 'stop-picker__chip--active' : ''}`}
                  onClick={() => toggleFacet(t.id)}
                >
                  {t.label}
                </Button>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { StopAtCheckFilters };
