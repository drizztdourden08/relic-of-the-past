/* @layer renderer-widgets @kind component */
/**
 * Content for the Checks widget.
 * Wraps TrackerSummary + TrackerFilters + TrackerGroupTree with data subscriptions.
 */
import { Box } from '../../../design-system/primitives/Box';
import { Text } from '../../../design-system/primitives/Text';
import { TrackerSummary } from '../../app/views/TrackerView/sub-components/TrackerSummary';
import { TrackerFilters } from '../../app/views/TrackerView/sub-components/TrackerFilters';
import { TrackerGroupTree } from '../../app/views/TrackerView/sub-components/TrackerGroupTree';
import { useChecksData } from './behavior/useChecksData';

const ChecksWidgetContent = () => {
  const { viewMode, setViewMode, grouping, setGrouping, filter, setFilter, snapshot, stats, groupTree } = useChecksData();

  return (
    <Box className="checks-widget-content">
      <TrackerSummary {...stats} />
      <TrackerFilters
        filter={filter}
        onFilterChange={setFilter}
        grouping={grouping}
        onGroupingChange={setGrouping}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {(filter.searchQuery || filter.activeFacets.length > 0 || (filter.itemFilter && filter.itemFilter !== 'all') || (filter.statusFilter && filter.statusFilter !== 'all')) && (
        <Box className="tracker-view__filtered-stats">
          Showing {groupTree.stats.total} checks:
          <Text className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</Text>,
          <Text className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</Text>,
          <Text className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</Text>
        </Box>
      )}
      <Box className="tracker-view__checks">
        <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
      </Box>
    </Box>
  );
};

export { ChecksWidgetContent };
