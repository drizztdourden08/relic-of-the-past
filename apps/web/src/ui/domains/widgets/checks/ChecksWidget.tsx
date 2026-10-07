/* @layer renderer-widgets @kind component */
/**
 * ChecksWidget: the Checks widget's content. The shared ChecksTracker
 * compound, wired to the live tracker data. With a randomizer session loaded
 * the same component shows each check's ACTUAL contents, which is what the
 * randomizer page's spoiler tab shows too.
 */
import { useEffect } from 'react';
import { ChecksTracker } from '@domains/app/compounds/ChecksTracker';
import { useTrackerPresenceStore } from '@app/stores/tracker-presence-store';
import { useTrackerData } from '../../../../hooks/useTrackerData';
import { useStickyHeader } from './behavior/useStickyHeader';

const ChecksWidgetContent = () => {
  const {
    eventStatus,
    viewMode, setViewMode, grouping, setGrouping, filter, setFilter, snapshot, stats, groupTree, run,
    panels, setPanels, expandedGroups, toggleGroup,
  } = useTrackerData({ prefKey: 'checks' });
  const [stickyHeader] = useStickyHeader();
  const setOpen = useTrackerPresenceStore((s) => s.setOpen);
  // On screen for as long as this is mounted: the check toasts follow it.
  useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, [setOpen]);

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
      eventStatus={eventStatus}
      run={run}
      panels={panels}
      onPanelsChange={setPanels}
      expandedGroups={expandedGroups}
      onToggleGroup={toggleGroup}
      stickyHeader={stickyHeader}
    />
  );
};

export { ChecksWidgetContent };
