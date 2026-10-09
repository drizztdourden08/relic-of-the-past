/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ChecksTracker } from '@app/compounds/ChecksTracker';
import { useTrackerData } from '../../../hooks/useTrackerData';
import { SPOILER_DIMENSIONS } from './SpoilerPanel.constants';

const countOf = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

const SpoilerPanel = () => {
  const {
    viewMode, setViewMode, grouping, setGrouping, filter, setFilter,
    snapshot, stats, groupTree, run, placement, placementView,
  } = useTrackerData({ initialGrouping: ['sphere'], initialViewMode: 'detailed' });

  const unplacedNotice = useMemo(() => {
    const { unmatchedLocations, unmatchedItems } = placementView;
    if (unmatchedLocations.length === 0 && unmatchedItems.length === 0) return null;
    const parts: string[] = [];
    if (unmatchedLocations.length > 0) {
      parts.push(`${countOf(unmatchedLocations.length, 'placed location has', 'placed locations have')} no check here`);
    }
    if (unmatchedItems.length > 0) {
      parts.push(`${countOf(unmatchedItems.length, 'placed item has', 'placed items have')} no record here`);
    }
    return (
      <Text
        className="randomizer-page__hint"
        title={[...unmatchedLocations, ...unmatchedItems].join('\n')}
      >
        {parts.join(' · ')}, not shown below.
      </Text>
    );
  }, [placementView]);

  if (!placement) {
    return (
      <Box className="randomizer-page__scroll">
        <Box className="randomizer-page__panel">
          <Text className="randomizer-page__hint">
            No placement loaded. A local run loads its spoiler when the session starts.
          </Text>
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
