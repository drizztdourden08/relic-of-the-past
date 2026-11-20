/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
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
  const t = useT();
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
            {t('compounds:checks-tracker.showing', { total: groupTree.stats.total })}
            <Text className="tracker-summary__stat--completed"> {t('compounds:checks-tracker.taken', { count: groupTree.stats.completed })}</Text>,
            <Text className="tracker-summary__stat--reachable"> {t('compounds:checks-tracker.available', { count: groupTree.stats.reachable })}</Text>,
            <Text className="tracker-summary__stat--blocked"> {t('compounds:checks-tracker.left', { count: groupTree.stats.blocked })}</Text>
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
