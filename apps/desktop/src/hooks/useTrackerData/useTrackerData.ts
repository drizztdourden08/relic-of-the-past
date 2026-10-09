/* @layer renderer-lib @kind hook */
import { useCallback, useMemo } from 'react';
import { normalPlacement, trackerCheckRecords, trackerStatuses } from '@rotp/navigation';
import { liveChestItems, find, buildGroupTree, filterChecks, smallKeyDoorsOf } from '@rotp/game-data';
import type { FilterState, GroupDimension, RunContext } from '@rotp/game-data';
import { buildPlacementView, runKindOfSession } from '../../game/randomizer-client';
import type { PlacementView } from '../../game/randomizer-client';
import type { ViewMode, TrackerPanels } from '../../compounds/ChecksTracker';
import { CLOSED_PANELS } from '../../compounds/ChecksTracker';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { TrackerDataOptions } from './use-tracker-data.type';
import { DEFAULT_GROUPING, EMPTY_FILTER, NO_GROUPS } from './use-tracker-data.constants';
import { useLiveTrackerInputs } from './useLiveTrackerInputs';
import { mergeStatusOnlyChecks } from './merge-status-only-checks';
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

  const checkRecords = useMemo(() => find('check', () => true), []);
  const effectiveCheckRecords = useMemo(
    () => trackerCheckRecords(checkRecords, placement),
    [checkRecords, placement],
  );
  const bigKeyDoors = filter.bigKeyDoors ?? true;
  const smallKeyDoors = smallKeyDoorsOf(filter, { kind: runKind });
  const darkRoomsNeedLight = filter.darkRoomsNeedLight ?? true;

  const effectiveCompleted = useMemo(
    () => mergeStatusOnlyChecks(completedChecks, checkRecords, eventStatus),
    [completedChecks, checkRecords, eventStatus],
  );

  const logicPlacement = placement ?? normalPlacement();
  const snapshot = useMemo(
    () => trackerStatuses({
      placement: logicPlacement,
      checks: effectiveCheckRecords,
      inventory,
      completed: effectiveCompleted,
      fired,
      darkRoomsNeedLight,
      bigKeyDoors,
      smallKeyDoors,
    }),
    [logicPlacement, effectiveCheckRecords, inventory, effectiveCompleted, fired, darkRoomsNeedLight, bigKeyDoors, smallKeyDoors],
  );

  const placementView: PlacementView = useMemo(
    () => buildPlacementView(placement, foreignOwners), [placement, foreignOwners],
  );
  const liveItems = useMemo(
    () => (runKind === 'normal' ? liveChestItems(checkRecords, inventory, effectiveCompleted) : undefined),
    [runKind, checkRecords, inventory, effectiveCompleted],
  );
  const run: RunContext = useMemo(
    () => (placement
      ? {
        kind: runKind, placedItems: placementView.itemByCheck,
        foreignItems: placementView.foreignByCheck, spheres: placementView.sphereByCheck,
      }
      : { kind: runKind, liveItems }),
    [placement, runKind, placementView, liveItems],
  );

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
