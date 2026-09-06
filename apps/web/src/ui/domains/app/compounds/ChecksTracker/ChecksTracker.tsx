/* @layer renderer-components @kind component */
/**
 * The checks tracker: summary bar, filters, and the grouped check tree. Bare
 * and presentational — every piece of data arrives as a prop, so the same
 * component serves the small Checks widget and the full-size spoiler tab, and
 * both show a check the same way.
 *
 * With a `run` supplied, checks display what THIS seed put in them instead of
 * their vanilla contents; without one, nothing changes for a vanilla profile.
 */
import { Box, Text } from '@ds/primitives';
import { TrackerSummary } from './sub-components/TrackerSummary';
import { TrackerFilters } from './sub-components/TrackerFilters';
import { TrackerGroupTree } from './sub-components/TrackerGroupTree';
import type { ChecksTrackerProps } from './ChecksTracker.type';
import './ChecksTracker.css';

/** True when anything narrows the set, so the filtered subtotal is worth showing. */
const isNarrowed = (filter: ChecksTrackerProps['filter']): boolean =>
  Boolean(filter.searchQuery)
  || filter.activeFacets.length > 0
  || (filter.itemFilter !== undefined && filter.itemFilter !== 'all')
  || (filter.statusFilter !== undefined && filter.statusFilter !== 'all');

const ChecksTracker = (props: ChecksTrackerProps) => {
  const {
    stats, filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange,
    groupTree, statuses, run, dimensions, notice, className,
  } = props;

  return (
    <Box className={`checks-tracker${className ? ` ${className}` : ''}`}>
      <TrackerSummary {...stats} />
      <TrackerFilters
        filter={filter}
        onFilterChange={onFilterChange}
        grouping={grouping}
        onGroupingChange={onGroupingChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        dimensions={dimensions}
      />
      {isNarrowed(filter) && (
        <Box className="tracker-view__filtered-stats">
          Showing {groupTree.stats.total} checks:
          <Text className="tracker-summary__stat--completed"> {groupTree.stats.completed} taken</Text>,
          <Text className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</Text>,
          <Text className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} left</Text>
        </Box>
      )}
      {notice}
      <Box className="tracker-view__checks">
        <TrackerGroupTree node={groupTree} statuses={statuses} viewMode={viewMode} run={run} />
      </Box>
    </Box>
  );
};

export { ChecksTracker };
