/* @layer renderer-widgets @kind component */
/**
 * ChecksWidget: the Checks widget's content. The shared ChecksTracker
 * compound, wired to the live tracker data. With a randomizer session loaded
 * the same component shows each check's ACTUAL contents, which is what the
 * randomizer page's spoiler tab shows too.
 */
import { ChecksTracker } from '@domains/app/compounds/ChecksTracker';
import { useTrackerData } from '../../../../hooks/useTrackerData';

const ChecksWidgetContent = () => {
  const {
    viewMode, setViewMode, grouping, setGrouping, filter, setFilter, snapshot, stats, groupTree, run,
    panels, setPanels, expandedGroups, toggleGroup,
  } = useTrackerData({ prefKey: 'checks' });

  return (
    <ChecksTracker
      className="checks-widget-content"
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
      panels={panels}
      onPanelsChange={setPanels}
      expandedGroups={expandedGroups}
      onToggleGroup={toggleGroup}
    />
  );
};

export { ChecksWidgetContent };
