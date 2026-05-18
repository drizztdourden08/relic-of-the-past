import { useState, useCallback } from 'react';
import type { CheckTag } from '@shared/game/checks/tags';
import { TAG_DEFINITIONS } from '@shared/game/checks/tags';
import type { GroupDimension, StatusFilter } from '@shared/game/checks/grouping';
import { GROUP_DIMENSIONS } from '@shared/game/checks/grouping';
import type { FilterState } from '@shared/game/checks/grouping';
import './TrackerView.css';

export type ViewMode = 'compact' | 'detailed' | 'visual';

interface TrackerFiltersProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const TrackerFilters = (props: TrackerFiltersProps) => {
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
    <div className="tracker-filters">
      {/* Search */}
      <div className="tracker-filters__search">
        <input
          type="text"
          className="tracker-filters__input"
          placeholder="Search checks..."
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
        />
      </div>

      {/* Controls row */}
      <div className="tracker-filters__controls">
        {/* View mode toggle */}
        <div className="tracker-filters__view-modes">
          {(['compact', 'detailed', 'visual'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              className={`tracker-filters__mode-btn ${viewMode === mode ? 'tracker-filters__mode-btn--active' : ''}`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode === 'compact' ? '≡' : mode === 'detailed' ? '☰' : '⊞'}
            </button>
          ))}
        </div>

        {/* Item reward filter */}
        <select
          className={`tracker-filters__select ${filter.itemFilter && filter.itemFilter !== 'all' ? 'tracker-filters__select--active' : ''}`}
          value={filter.itemFilter ?? 'all'}
          onChange={(e) => onFilterChange({ ...filter, itemFilter: e.target.value as 'all' | 'rewards' | 'non-rewards' })}
        >
          <option value="all">All checks</option>
          <option value="rewards">Rewards</option>
          <option value="non-rewards">Non-rewards</option>
        </select>

        {/* Status filter */}
        <div className="tracker-filters__status-group">
          {([
            { value: 'all', label: 'All', cls: '' },
            { value: 'reachable', label: '●', cls: 'tracker-filters__status-btn--reachable' },
            { value: 'completed', label: '✓', cls: 'tracker-filters__status-btn--completed' },
            { value: 'blocked', label: '✕', cls: 'tracker-filters__status-btn--blocked' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              className={`tracker-filters__status-btn ${opt.cls} ${(filter.statusFilter ?? 'all') === opt.value ? 'tracker-filters__status-btn--active' : ''}`}
              onClick={() => onFilterChange({ ...filter, statusFilter: opt.value as StatusFilter })}
              title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tag filter toggle */}
        <button
          className={`tracker-filters__btn ${filter.activeTags.length > 0 ? 'tracker-filters__btn--active' : ''}`}
          onClick={() => setShowTagFilter(!showTagFilter)}
        >
          Tags{filter.activeTags.length > 0 ? ` (${filter.activeTags.length})` : ''}
        </button>

        {/* Grouping toggle */}
        <button
          className={`tracker-filters__btn ${grouping.length > 0 ? 'tracker-filters__btn--active' : ''}`}
          onClick={() => setShowGroupConfig(!showGroupConfig)}
        >
          Group{grouping.length > 0 ? ` (${grouping.length})` : ''}
        </button>
      </div>

      {/* Tag filter panel */}
      {showTagFilter && (
        <div className="tracker-filters__tags-panel">
          <div className="tracker-filters__tag-mode">
            <button
              className={filter.tagMode === 'any' ? 'tracker-filters__mode-btn--active' : ''}
              onClick={() => onFilterChange({ ...filter, tagMode: 'any' })}
            >Any</button>
            <button
              className={filter.tagMode === 'all' ? 'tracker-filters__mode-btn--active' : ''}
              onClick={() => onFilterChange({ ...filter, tagMode: 'all' })}
            >All</button>
          </div>
          {(['world', 'location', 'area', 'content'] as const).map(cat => (
            <div key={cat} className="tracker-filters__tag-group">
              <span className="tracker-filters__tag-group-label">{cat}</span>
              <div className="tracker-filters__tag-list">
                {TAG_DEFINITIONS.filter(t => t.category === cat).map(t => (
                  <button
                    key={t.id}
                    className={`tracker-filters__tag ${filter.activeTags.includes(t.id) ? 'tracker-filters__tag--active' : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grouping config panel */}
      {showGroupConfig && (
        <div className="tracker-filters__group-panel">
          <div className="tracker-filters__group-current">
            {grouping.length === 0 && <span className="tracker-filters__group-empty">No grouping (flat list)</span>}
            {grouping.map((dim, i) => (
              <span key={dim} className="tracker-filters__group-chip">
                {i + 1}. {GROUP_DIMENSIONS.find(d => d.id === dim)?.label}
                <button className="tracker-filters__group-remove" onClick={() => removeDimension(i)}>×</button>
              </span>
            ))}
          </div>
          {grouping.length < 5 && (
            <div className="tracker-filters__group-add">
              {GROUP_DIMENSIONS.filter(d => !grouping.includes(d.id)).map(d => (
                <button
                  key={d.id}
                  className="tracker-filters__group-add-btn"
                  onClick={() => addDimension(d.id)}
                  title={d.description}
                >
                  + {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
