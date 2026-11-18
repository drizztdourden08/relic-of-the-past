/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
import type { GroupDimension } from '@rotp/game-data';
import { GROUP_DIMENSIONS } from '@rotp/game-data';
import { Box, Button, Card, Icon, IconButton, SegmentedControl, Text, TagPicker } from '@drizztdourden08/tessera/primitives';
import { CLOSE_PATHS, MAX_DIMENSIONS, TAG_GROUPS, tagModeOptions } from '../ChecksTracker.constants';
import type { TrackerFilterPanelsProps } from '../ChecksTracker.type';
import './TrackerFilterPanels.css';

const TrackerFilterPanels = (props: TrackerFilterPanelsProps) => {
  const t = useT();
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
            options={tagModeOptions(t)}
            onChange={(tagMode) => onFilterChange({ ...filter, tagMode })}
          />
          <TagPicker value={filter.activeFacets} groups={TAG_GROUPS} onChange={setFacets} />
        </Card>
      )}

      {showGroupConfig && (
        <Card className="tracker-filters__panel">
          <Box className="tracker-filters__group-current">
            {grouping.length === 0 && <Text className="tracker-filters__group-empty">{t('compounds:tracker.panels.flat')}</Text>}
            {grouping.map((dim, i) => (
              <Box key={dim} className="tracker-filters__group-chip">
                <Text>{i + 1}. {dimensions.find(d => d.id === dim)?.label}</Text>
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={t('compounds:tracker.panels.remove', { name: dim })}
                  className="tracker-filters__group-remove"
                  onClick={() => removeDimension(i)}
                >
                  <Icon path={{ d: CLOSE_PATHS }} size={9} />
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
