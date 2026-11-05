/* @layer renderer-lib @kind hook */
import { useCallback, useMemo } from 'react';
import { buildGroupTree, filterChecks } from '@rotp/game-data';
import type { CheckId, FilterState, GroupDimension, ItemId } from '@rotp/game-data';
import { useTrackerFeed, useTrackerReading } from '@drizztdourden08/brock-randomizer/renderer';
import { runKindOfSession } from '../../game/randomizer-client';
import type { ViewMode, TrackerPanels } from '../../compounds/ChecksTracker';
import { CLOSED_PANELS } from '../../compounds/ChecksTracker';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { TrackerDataOptions } from './use-tracker-data.type';
import {
  DEFAULT_GROUPING, EMPTY_FILTER, NO_COMPLETED, NO_GROUPS, NO_ITEMS,
} from './use-tracker-data.constants';
import { assumedIdsOf } from './assumed-ids-of';
import { useEventStatus } from './useEventStatus';
import { useSessionState } from './useSessionState';
import { useTrackerRun } from './useTrackerRun';
import { useTrackerStatuses } from './useTrackerStatuses';
import { countTrackerStats } from './count-tracker-stats';

const useTrackerData = (options: TrackerDataOptions = {}) => {
  const { initialGrouping = DEFAULT_GROUPING, initialViewMode = 'visual', prefKey = null } = options;

  const feed = useTrackerFeed();
  const eventStatus = useEventStatus();
  const sessionState = useSessionState();
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

  const { placement } = sessionState;
  const runKind = runKindOfSession(sessionState);
  const assumed = useMemo(() => assumedIdsOf(filter, runKind), [filter, runKind]);
  const reading = useTrackerReading(assumed);

  const inventory = useMemo(() => (feed ? new Set(feed.held as readonly ItemId[]) : NO_ITEMS), [feed]);
  const completed = (feed?.completed ?? NO_COMPLETED) as ReadonlySet<CheckId>;

  const { checkRecords, effectiveCheckRecords, snapshot } = useTrackerStatuses({ placement, reading });
  const { placementView, run } = useTrackerRun({
    session: sessionState, runKind, checkRecords, inventory, completed,
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
