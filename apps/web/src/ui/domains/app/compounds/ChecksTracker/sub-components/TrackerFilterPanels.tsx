/* @layer renderer-components @kind component */
/**
 * The two drawers behind the filter bar: facet tags, and the grouping stack.
 * Both are design-system controls, so a tag chip here is the same chip as a tag
 * chip anywhere else in the app.
 */
import { useCallback, useMemo } from 'react';
import type { GroupDimension, GroupDimensionDef, FilterState } from '@shared/game/logic/queries/check-grouping';
import { CHECK_FACET_DEFS, GROUP_DIMENSIONS } from '@shared/game/logic/queries/check-grouping';
import { Box, Button, Card, Icon, IconButton, SegmentedControl, Text, TagPicker } from '@ds/primitives';
import type { SegmentOption, TagPickerGroup } from '@ds/primitives';
import { CLOSE_PATHS } from '../ChecksTracker.constants';

interface TrackerFilterPanelsProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  grouping: GroupDimension[];
  onGroupingChange: (dims: GroupDimension[]) => void;
  showTagFilter: boolean;
  showGroupConfig: boolean;
  /** Grouping axes to offer. Defaults to the base catalog. */
  dimensions?: readonly GroupDimensionDef[];
}

const TAG_CATEGORIES = ['world', 'location', 'area', 'content'] as const;

const TAG_GROUPS: TagPickerGroup[] = TAG_CATEGORIES.map((category) => ({
  id: category,
  label: category,
  options: CHECK_FACET_DEFS.filter(t => t.category === category).map(t => ({ value: t.id, label: t.label })),
}));

const TAG_MODE_OPTIONS: SegmentOption<'any' | 'all'>[] = [
  { value: 'any', label: 'Any', title: 'Match any active tag' },
  { value: 'all', label: 'All', title: 'Match every active tag' },
];

/** Five axes is the tree's depth limit, past which a group holds one check. */
const MAX_DIMENSIONS = 5;

const TrackerFilterPanels = (props: TrackerFilterPanelsProps) => {
  const {
    filter, onFilterChange, grouping, onGroupingChange, showTagFilter, showGroupConfig,
    dimensions = GROUP_DIMENSIONS,
  } = props;

  const setFacets = useCallback((activeFacets: string[]) => {
    onFilterChange({ ...filter, activeFacets });
  }, [filter, onFilterChange]);

  const addDimension = useCallback((dim: GroupDimension) => {
    if (grouping.length < MAX_DIMENSIONS && !grouping.includes(dim)) onGroupingChange([...grouping, dim]);
  }, [grouping, onGroupingChange]);

  const removeDimension = useCallback((idx: number) => {
    onGroupingChange(grouping.filter((_, i) => i !== idx));
  }, [grouping, onGroupingChange]);

  const unused = useMemo(() => dimensions.filter(d => !grouping.includes(d.id)), [dimensions, grouping]);

  return (
    <>
      {showTagFilter && (
        <Card className="tracker-filters__panel">
          <SegmentedControl
            value={filter.tagMode}
            options={TAG_MODE_OPTIONS}
            onChange={(tagMode) => onFilterChange({ ...filter, tagMode })}
          />
          <TagPicker value={filter.activeFacets} groups={TAG_GROUPS} onChange={setFacets} />
        </Card>
      )}

      {showGroupConfig && (
        <Card className="tracker-filters__panel">
          <Box className="tracker-filters__group-current">
            {grouping.length === 0 && <Text className="tracker-filters__group-empty">No grouping (flat list)</Text>}
            {grouping.map((dim, i) => (
              <Box key={dim} className="tracker-filters__group-chip">
                <Text>{i + 1}. {dimensions.find(d => d.id === dim)?.label}</Text>
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={`Remove ${dim} grouping`}
                  className="tracker-filters__group-remove"
                  onClick={() => removeDimension(i)}
                >
                  <Icon paths={CLOSE_PATHS} size={9} />
                </IconButton>
              </Box>
            ))}
          </Box>
          {grouping.length < MAX_DIMENSIONS && (
            <Box className="tracker-filters__group-add">
              {unused.map(d => (
                <Button key={d.id} variant="ghost" size="sm" title={d.description} onClick={() => addDimension(d.id)}>
                  + {d.label}
                </Button>
              ))}
            </Box>
          )}
        </Card>
      )}
    </>
  );
};

export { TrackerFilterPanels };
