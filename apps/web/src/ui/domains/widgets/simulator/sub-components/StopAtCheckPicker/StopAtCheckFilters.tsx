/* @layer renderer-widgets @kind component */
/**
 * The search box + tag / item / status filter row for the stop-at-check picker.
 * Drives the shared FilterState (consumed by `filterChecks`), mirroring the
 * filters the checks widget offers.
 */
import { useCallback, useState } from 'react';
import { Box, Button, TextInput } from '@ds/primitives';
import type { FilterState, ItemFilter, StatusFilter } from '@shared/game/logic/queries/check-grouping';
import { CHECK_TAG_DEFINITIONS } from '@shared/game/data';
import type { CheckTag } from '@shared/game/data';

interface StopAtCheckFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

const ITEM_FILTERS: { value: ItemFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Junk' },
];

const STATUS_FILTERS: { value: StatusFilter; label: string; title: string }[] = [
  { value: 'all', label: 'All', title: 'Any status' },
  { value: 'reachable', label: '●', title: 'Reachable' },
  { value: 'completed', label: '✓', title: 'Completed' },
  { value: 'blocked', label: '○', title: 'Blocked' },
];

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const StopAtCheckFilters = (props: StopAtCheckFiltersProps) => {
  const { filter, onFilterChange } = props;
  const [showTags, setShowTags] = useState(false);

  const itemFilter = filter.itemFilter ?? 'all';
  const statusFilter = filter.statusFilter ?? 'all';

  const toggleTag = useCallback((tag: CheckTag) => {
    const activeTags = filter.activeTags.includes(tag)
      ? filter.activeTags.filter((t) => t !== tag)
      : [...filter.activeTags, tag];
    onFilterChange({ ...filter, activeTags });
  }, [filter, onFilterChange]);

  return (
    <Box className="stop-picker__filters">
      <TextInput
        type="text"
        className="stop-picker__search"
        placeholder="Search checks…"
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
        className={`stop-picker__chip ${filter.activeTags.length > 0 ? 'stop-picker__chip--active' : ''}`}
        onClick={() => setShowTags((v) => !v)}
      >
        Tags{filter.activeTags.length > 0 ? ` (${filter.activeTags.length})` : ''}
      </Button>

      {showTags && (
        <Box className="stop-picker__tags">
          {TAG_CATEGORIES.map((cat) => (
            <Box key={cat} className="stop-picker__tag-group">
              {CHECK_TAG_DEFINITIONS.filter((t) => t.category === cat).map((t) => (
                <Button
                  variant="bare"
                  size="sm"
                  key={t.id}
                  className={`stop-picker__chip ${filter.activeTags.includes(t.id) ? 'stop-picker__chip--active' : ''}`}
                  onClick={() => toggleTag(t.id)}
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
