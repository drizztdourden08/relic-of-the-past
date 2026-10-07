/* @layer renderer-components @kind component */
/**
 * The checks tracker: summary bar, filters, and the grouped check tree. Bare
 * and presentational: every piece of data arrives as a prop, so the same
 * component serves the small Checks widget and the full-size spoiler tab, and
 * both show a check the same way.
 *
 * The summary and filters are one header band, and the tree is the scroller
 * under it: with `stickyHeader` the header holds its place while the list moves,
 * without it the whole tracker scrolls as one piece.
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
    groupTree, statuses, run, dimensions, notice, stickyHeader = true, className,
    panels, onPanelsChange, expandedGroups, onToggleGroup,
  } = props;

  return (
    <Box className={`checks-tracker${className ? ` ${className}` : ''}`} data-sticky={stickyHeader ? 'yes' : 'no'}>
      <Box className="checks-tracker__header">
        <TrackerSummary {...stats} />
        <TrackerFilters
          filter={filter}
          onFilterChange={onFilterChange}
          grouping={grouping}
          onGroupingChange={onGroupingChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          dimensions={dimensions}
          panels={panels}
          onPanelsChange={onPanelsChange}
        />
        {isNarrowed(filter) && (
          <Box className="checks-tracker__subtotal">
            Showing {groupTree.stats.total} checks:
            <Text className="tracker-summary__stat--completed"> {groupTree.stats.completed} taken</Text>,
            <Text className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</Text>,
            <Text className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} left</Text>
          </Box>
        )}
        {notice}
      </Box>
      <Box className="checks-tracker__list">
        <TrackerGroupTree
          node={groupTree}
          statuses={statuses}
          viewMode={viewMode}
          run={run}
          expandedGroups={expandedGroups}
          onToggleGroup={onToggleGroup}
        />
      </Box>
    </Box>
  );
};

export { ChecksTracker };
