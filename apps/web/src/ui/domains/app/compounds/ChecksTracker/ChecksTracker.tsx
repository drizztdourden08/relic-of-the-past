/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import { TrackerSummary } from './sub-components/TrackerSummary';
import { TrackerFilters } from './sub-components/TrackerFilters';
import { TrackerGroupTree } from './sub-components/TrackerGroupTree';
import type { ChecksTrackerProps } from './ChecksTracker.type';
import './ChecksTracker.css';

const isNarrowed = (filter: ChecksTrackerProps['filter']): boolean =>
  Boolean(filter.searchQuery)
  || filter.activeFacets.length > 0
  || (filter.itemFilter !== undefined && filter.itemFilter !== 'all')
  || (filter.statusFilter !== undefined && filter.statusFilter !== 'all');

const ChecksTracker = (props: ChecksTrackerProps) => {
  const {
    stats, filter, onFilterChange, grouping, onGroupingChange, viewMode, onViewModeChange,
    groupTree, statuses, eventStatus, run, dimensions, notice, stickyHeader = true, className,
    panels, onPanelsChange, expandedGroups, onToggleGroup,
  } = props;

  return (
    <Box className={`checks-tracker${className ? ` ${className}` : ''}`} data-sticky={stickyHeader ? 'yes' : 'no'}>
      <Box className="checks-tracker__header">
        <TrackerSummary {...stats} />
        <TrackerFilters
          filter={filter}
          onFilterChange={onFilterChange}
          run={run}
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
          eventStatus={eventStatus}
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
