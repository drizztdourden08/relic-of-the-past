/* @layer renderer-lib @kind hook */
import { useCallback, useMemo } from 'react';
import { buildGroupTree, filterChecks } from '@rotp/game-data';
import type { FilterState, GroupDimension } from '@rotp/game-data';
import { runKindOfSession } from '../../game/randomizer-client';
import type { ViewMode, TrackerPanels } from '../../compounds/ChecksTracker';
import { CLOSED_PANELS } from '../../compounds/ChecksTracker';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { TrackerDataOptions } from './use-tracker-data.type';
import { DEFAULT_GROUPING, EMPTY_FILTER, NO_GROUPS } from './use-tracker-data.constants';
import { useLiveTrackerInputs } from './useLiveTrackerInputs';
import { useTrackerRun } from './useTrackerRun';
import { useTrackerStatuses } from './useTrackerStatuses';
import { countTrackerStats } from './count-tracker-stats';

const useTrackerData = (options: TrackerDataOptions = {}) => {
  const { initialGrouping = DEFAULT_GROUPING, initialViewMode = 'visual', prefKey = null } = options;

  const { inventory, completedChecks, eventStatus, sessionState, fired } = useLiveTrackerInputs();
  const [viewMode, setViewMode] = useWidgetPref<ViewMode>(prefKey, 'viewMode', initialViewMode);
  const [grouping, setGrouping] = useWidgetPref<GroupDimension[]>(prefKey, 'grouping', initialGrouping);
  const [filter, setFilter] = useWidgetPref<FilterState>(prefKey, 'filter', EMPTY_FILTER);
  const [panels, setPanels] = useWidgetPref<TrackerPanels>(prefKey, 'panels', CLOSED_PANELS);
  const [expandedGroups, setExpandedGroups] = useWidgetPref<readonly string[]>(prefKey, 'expanded', NO_GROUPS);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups(expandedGroups.includes(key)
      ? expandedGroups.filter((k) => k !== key)
      : [...expandedGroups, key]);
  }, [expandedGroups, setExpandedGroups]);

  const { placement, foreignOwners } = sessionState;
  const runKind = runKindOfSession(sessionState);

  const { checkRecords, effectiveCheckRecords, effectiveCompleted, snapshot } = useTrackerStatuses({
    placement, runKind, filter, inventory, completedChecks, eventStatus, fired,
  });
  const { placementView, run } = useTrackerRun({
    placement, foreignOwners, runKind, checkRecords, inventory, effectiveCompleted,
  });

  const stats = useMemo(
    () => countTrackerStats(effectiveCheckRecords, filter, run, snapshot),
    [snapshot, effectiveCheckRecords, filter, run],
  );

  const filteredChecks = useMemo(
    () => filterChecks(effectiveCheckRecords, filter, snapshot, run),
    [effectiveCheckRecords, filter, snapshot, run],
  );
  const groupTree = useMemo(
    () => buildGroupTree(filteredChecks, snapshot, grouping, run),
    [filteredChecks, snapshot, grouping, run],
  );

  return {
    viewMode, setViewMode,
    grouping, setGrouping,
    filter, setFilter,
    panels, setPanels,
    expandedGroups, toggleGroup,
    snapshot, stats, groupTree, eventStatus,
    placement, placementView, run, runKind,
  };
};

export { useTrackerData };
