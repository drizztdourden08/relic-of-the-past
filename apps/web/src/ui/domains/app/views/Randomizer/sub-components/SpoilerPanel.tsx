/* @layer renderer-components @kind component */
/**
 * The spoiler tab: the SAME checks tracker the Checks widget renders, given
 * the room to be read properly. It shows every check holding what this seed
 * actually put there, counted as taken / available / left, and adds the one
 * grouping axis only a run can offer: the sweep sphere.
 *
 * Locations the placement carries but this app's check dataset does not are
 * reported instead of dropped: a spoiler that omits rows is worse
 * than one that says how many it could not place.
 */
import { useMemo } from 'react';
import { Box, Text } from '@ds/primitives';
import { ChecksTracker } from '@domains/app/compounds/ChecksTracker';
import { GROUP_DIMENSIONS, SPHERE_DIMENSION } from '@shared/game/logic/queries/check-grouping';
import { useTrackerData } from '../../../../../../hooks/useTrackerData';

const SPOILER_DIMENSIONS = [SPHERE_DIMENSION, ...GROUP_DIMENSIONS];

const SpoilerPanel = () => {
  const {
    viewMode, setViewMode, grouping, setGrouping, filter, setFilter,
    snapshot, stats, groupTree, run, placement, placementView,
  } = useTrackerData({ initialGrouping: ['sphere'], initialViewMode: 'detailed' });

  const notice = useMemo(() => {
    const { unmatchedLocations, unmatchedItems } = placementView;
    if (unmatchedLocations.length === 0 && unmatchedItems.length === 0) return null;
    const parts: string[] = [];
    if (unmatchedLocations.length > 0) parts.push(`${unmatchedLocations.length} placed locations have no check here`);
    if (unmatchedItems.length > 0) parts.push(`${unmatchedItems.length} placed items have no record here`);
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
      notice={notice}
    />
  );
};

export { SpoilerPanel };
