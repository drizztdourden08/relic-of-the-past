/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { GroupDimension, FilterState } from '@shared/game/logic/queries/check-grouping';
import { CHECK_FACET_DEFS, GROUP_DIMENSIONS } from '@shared/game/logic/queries/check-grouping';
import { Box, Text, Button } from '../../../../../design-system/primitives';

interface TrackerFilterPanelsProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  showTagFilter: boolean;
  showGroupConfig: boolean;
}

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const TrackerFilterPanels = (props: TrackerFilterPanelsProps) => {
  const { filter, onFilterChange, grouping, onGroupingChange, showTagFilter, showGroupConfig } = props;

  const toggleFacet = useCallback((facetId: string) => {
    const active = filter.activeFacets.includes(facetId)
      ? filter.activeFacets.filter(f => f !== facetId)
      : [...filter.activeFacets, facetId];
    onFilterChange({ ...filter, activeFacets: active });
  }, [filter, onFilterChange]);

  const addDimension = useCallback((dim: GroupDimension) => {
    if (grouping.length < 5 && !grouping.includes(dim)) onGroupingChange([...grouping, dim]);
  }, [grouping, onGroupingChange]);

  const removeDimension = useCallback((idx: number) => {
    onGroupingChange(grouping.filter((_, i) => i !== idx));
  }, [grouping, onGroupingChange]);

  return (
    <>
      {showTagFilter && (
        <Box className="tracker-filters__tags-panel">
          <Box className="tracker-filters__tag-mode">
            <Button variant="bare" className={filter.tagMode === 'any' ? 'tracker-filters__mode-btn--active' : ''} onClick={() => onFilterChange({ ...filter, tagMode: 'any' })}>Any</Button>
            <Button variant="bare" className={filter.tagMode === 'all' ? 'tracker-filters__mode-btn--active' : ''} onClick={() => onFilterChange({ ...filter, tagMode: 'all' })}>All</Button>
          </Box>
          {TAG_CATEGORIES.map(cat => (
            <Box key={cat} className="tracker-filters__tag-group">
              <Text className="tracker-filters__tag-group-label">{cat}</Text>
              <Box className="tracker-filters__tag-list">
                {CHECK_FACET_DEFS.filter(t => t.category === cat).map(t => (
                  <Button
                    variant="bare"
                    key={t.id}
                    className={`tracker-filters__tag ${filter.activeFacets.includes(t.id) ? 'tracker-filters__tag--active' : ''}`}
                    onClick={() => toggleFacet(t.id)}
                  >
                    {t.label}
                  </Button>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {showGroupConfig && (
        <Box className="tracker-filters__group-panel">
          <Box className="tracker-filters__group-current">
            {grouping.length === 0 && <Text className="tracker-filters__group-empty">No grouping (flat list)</Text>}
            {grouping.map((dim, i) => (
              <Text key={dim} className="tracker-filters__group-chip">
                {i + 1}. {GROUP_DIMENSIONS.find(d => d.id === dim)?.label}
                <Button variant="bare" className="tracker-filters__group-remove" onClick={() => removeDimension(i)}>×</Button>
              </Text>
            ))}
          </Box>
          {grouping.length < 5 && (
            <Box className="tracker-filters__group-add">
              {GROUP_DIMENSIONS.filter(d => !grouping.includes(d.id)).map(d => (
                <Button variant="bare" key={d.id} className="tracker-filters__group-add-btn" onClick={() => addDimension(d.id)} title={d.description}>
                  + {d.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export { TrackerFilterPanels };
