/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ChecksTracker } from '@app/compounds/ChecksTracker';
import { useTrackerData } from '../../../hooks/useTrackerData';
import { SPOILER_DIMENSIONS } from './SpoilerPanel.constants';
import './SpoilerPanel.css';

const SpoilerPanel = () => {
  const t = useT();
  const {
    viewMode, setViewMode, grouping, setGrouping, filter, setFilter,
    snapshot, stats, groupTree, run, placement, placementView,
  } = useTrackerData({ initialGrouping: ['sphere'], initialViewMode: 'detailed' });

  const unplacedNotice = useMemo(() => {
    const { unmatchedLocations, unmatchedItems } = placementView;
    if (unmatchedLocations.length === 0 && unmatchedItems.length === 0) return null;
    const locations = unmatchedLocations.length;
    const items = unmatchedItems.length;
    let notice: string;
    if (items === 0) notice = t('views-randomizer:spoiler.unplaced.locations', { count: locations });
    else if (locations === 0) notice = t('views-randomizer:spoiler.unplaced.items', { count: items });
    else notice = t('views-randomizer:spoiler.unplaced.both', { locations, items });
    return (
      <Text
        className="randomizer-page__hint"
        title={[...unmatchedLocations, ...unmatchedItems].join('\n')}
      >
        {notice}
      </Text>
    );
  }, [placementView, t]);

  if (!placement) {
    return (
      <Box className="randomizer-page__scroll">
        <Box className="randomizer-page__panel">
          <Text className="randomizer-page__hint">{t('views-randomizer:spoiler.noPlacement')}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <ChecksTracker
      className="spoiler-tracker"
      stats={stats}
      filter={filter}
      onFilterChange={setFilter}
      grouping={grouping}
      onGroupingChange={setGrouping}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      groupTree={groupTree}
      statuses={snapshot}
      run={run}
      dimensions={SPOILER_DIMENSIONS}
      notice={unplacedNotice}
    />
  );
};

export { SpoilerPanel };
