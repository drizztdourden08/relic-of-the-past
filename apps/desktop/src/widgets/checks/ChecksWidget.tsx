/**
 * ChecksWidget — Content for the Checks widget.
 * Wraps TrackerSummary + TrackerFilters + TrackerGroupTree with data subscriptions.
 */
import { TrackerSummary } from '../../components/views/TrackerView/TrackerSummary';
import { TrackerFilters } from '../../components/views/TrackerView/TrackerFilters';
import { TrackerGroupTree } from '../../components/views/TrackerView/TrackerGroupTree';
import { useChecksData } from './behavior/useChecksData';

export const ChecksWidgetContent = () => {
  const { viewMode, setViewMode, grouping, setGrouping, filter, setFilter, snapshot, stats, groupTree } = useChecksData();

  return (
    <div className="checks-widget-content">
      <TrackerSummary {...stats} />
      <TrackerFilters
        filter={filter}
        onFilterChange={setFilter}
        grouping={grouping}
        onGroupingChange={setGrouping}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {(filter.searchQuery || filter.activeTags.length > 0 || (filter.itemFilter && filter.itemFilter !== 'all') || (filter.statusFilter && filter.statusFilter !== 'all')) && (
        <div className="tracker-view__filtered-stats">
          Showing {groupTree.stats.total} checks:
          <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
          <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
          <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
        </div>
      )}
      <div className="tracker-view__checks">
        <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
      </div>
    </div>
  );
};

