/* @layer renderer-components @kind component */
import { useState, useCallback } from 'react';
import type { CheckTag } from '@shared/game/checks/tags';
import { TAG_DEFINITIONS } from '@shared/game/checks/tags';
import type { GroupDimension, StatusFilter } from '@shared/game/checks/grouping';
import { GROUP_DIMENSIONS } from '@shared/game/checks/grouping';
import type { FilterState } from '@shared/game/checks/grouping';
import { Box, Text, TextInput, Select } from '../../../../../design-system/primitives';
import '../TrackerView.css';

type ViewMode = 'compact' | 'detailed' | 'visual';

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ITEM_FILTER_OPTIONS = [
  { value: 'all', label: 'All checks' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'non-rewards', label: 'Non-rewards' },
];

const TrackerFilters = (props: TrackerFiltersProps) => {
  const { filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange } = props;
  const [showGroupConfig, setShowGroupConfig] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const toggleTag = useCallback((tag: CheckTag) => {
    const active = filter.activeTags.includes(tag)
      ? filter.activeTags.filter(t => t !== tag)
      : [...filter.activeTags, tag];
    onFilterChange({ ...filter, activeTags: active });
  }, [filter, onFilterChange]);

  const addDimension = useCallback((dim: GroupDimension) => {
    if (grouping.length < 5 && !grouping.includes(dim)) {
      onGroupingChange([...grouping, dim]);
    }
  }, [grouping, onGroupingChange]);

  const removeDimension = useCallback((idx: number) => {
    onGroupingChange(grouping.filter((_, i) => i !== idx));
  }, [grouping, onGroupingChange]);

  return (
    <Box className="tracker-filters">
      {/* Search */}
      <Box className="tracker-filters__search">
        <TextInput
          type="text"
          className="tracker-filters__input"
          placeholder="Search checks..."
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
        />
      </Box>

      {/* Controls row */}
      <Box className="tracker-filters__controls">
        {/* View mode toggle */}
        <Box className="tracker-filters__view-modes">
          {(['compact', 'detailed', 'visual'] as ViewMode[]).map(mode => (
            <Box
              as="button"
              key={mode}
              className={`tracker-filters__mode-btn ${viewMode === mode ? 'tracker-filters__mode-btn--active' : ''}`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode === 'compact' ? '≡' : mode === 'detailed' ? '☰' : '⊞'}
            </Box>
          ))}
        </Box>

        {/* Item reward filter */}
        <Select
          className={`tracker-filters__select ${filter.itemFilter && filter.itemFilter !== 'all' ? 'tracker-filters__select--active' : ''}`}
          value={filter.itemFilter ?? 'all'}
          options={ITEM_FILTER_OPTIONS}
          onChange={(v) => onFilterChange({ ...filter, itemFilter: v as 'all' | 'rewards' | 'non-rewards' })}
        />

        {/* Status filter */}
        <Box className="tracker-filters__status-group">
          {([
            { value: 'all', label: 'All', cls: '' },
            { value: 'reachable', label: '●', cls: 'tracker-filters__status-btn--reachable' },
            { value: 'completed', label: '✓', cls: 'tracker-filters__status-btn--completed' },
            { value: 'blocked', label: '✕', cls: 'tracker-filters__status-btn--blocked' },
          ] as const).map(opt => (
            <Box
              as="button"
              key={opt.value}
              className={`tracker-filters__status-btn ${opt.cls} ${(filter.statusFilter ?? 'all') === opt.value ? 'tracker-filters__status-btn--active' : ''}`}
              onClick={() => onFilterChange({ ...filter, statusFilter: opt.value as StatusFilter })}
              title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
            >
              {opt.label}
            </Box>
          ))}
        </Box>

        {/* Tag filter toggle */}
        <Box
          as="button"
          className={`tracker-filters__btn ${filter.activeTags.length > 0 ? 'tracker-filters__btn--active' : ''}`}
          onClick={() => setShowTagFilter(!showTagFilter)}
        >
          Tags{filter.activeTags.length > 0 ? ` (${filter.activeTags.length})` : ''}
        </Box>

        {/* Grouping toggle */}
        <Box
          as="button"
          className={`tracker-filters__btn ${grouping.length > 0 ? 'tracker-filters__btn--active' : ''}`}
          onClick={() => setShowGroupConfig(!showGroupConfig)}
        >
          Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
        </Box>
      </Box>

      {/* Tag filter panel */}
      {showTagFilter && (
        <Box className="tracker-filters__tags-panel">
          <Box className="tracker-filters__tag-mode">
            <Box
              as="button"
              className={filter.tagMode === 'any' ? 'tracker-filters__mode-btn--active' : ''}
              onClick={() => onFilterChange({ ...filter, tagMode: 'any' })}
            >Any</Box>
            <Box
              as="button"
              className={filter.tagMode === 'all' ? 'tracker-filters__mode-btn--active' : ''}
              onClick={() => onFilterChange({ ...filter, tagMode: 'all' })}
            >All</Box>
          </Box>
          {(['world', 'location', 'area', 'content'] as const).map(cat => (
            <Box key={cat} className="tracker-filters__tag-group">
              <Text className="tracker-filters__tag-group-label">{cat}</Text>
              <Box className="tracker-filters__tag-list">
                {TAG_DEFINITIONS.filter(t => t.category === cat).map(t => (
                  <Box
                    as="button"
                    key={t.id}
                    className={`tracker-filters__tag ${filter.activeTags.includes(t.id) ? 'tracker-filters__tag--active' : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.label}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Grouping config panel */}
      {showGroupConfig && (
        <Box className="tracker-filters__group-panel">
          <Box className="tracker-filters__group-current">
            {grouping.length === 0 && <Text className="tracker-filters__group-empty">No grouping (flat list)</Text>}
            {grouping.map((dim, i) => (
              <Text key={dim} className="tracker-filters__group-chip">
                {i + 1}. {GROUP_DIMENSIONS.find(d => d.id === dim)?.label}
                <Box as="button" className="tracker-filters__group-remove" onClick={() => removeDimension(i)}>×</Box>
              </Text>
            ))}
          </Box>
          {grouping.length < 5 && (
            <Box className="tracker-filters__group-add">
              {GROUP_DIMENSIONS.filter(d => !grouping.includes(d.id)).map(d => (
                <Box
                  as="button"
                  key={d.id}
                  className="tracker-filters__group-add-btn"
                  onClick={() => addDimension(d.id)}
                  title={d.description}
                >
                  + {d.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export { TrackerFilters };
export type { ViewMode };
