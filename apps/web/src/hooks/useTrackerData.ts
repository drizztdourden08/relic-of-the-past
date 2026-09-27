/* @layer renderer-lib @kind hook */
/**
 * Everything the checks tracker needs, subscribed live: the player's
 * inventory, the checks they have completed, the derived reachability
 * snapshot, and, when a randomizer session is loaded, what each check
 * actually holds this seed plus the sphere it belongs to.
 *
 * One hook for both surfaces (the Checks widget and the randomizer page's
 * spoiler tab) so the two can never drift apart on what a check contains.
 *
 * Reachability comes from ONE engine in both modes. A seed is judged over its own placement; the
 * plain game is judged over the placement where nothing moved (normal-placement.ts), so the
 * engine cannot tell the two apart and cannot disagree with itself. Rows the world holds no
 * location for keep being read from the dataset's own requirements, the same way in both modes
 * (tracker/tracker-statuses.ts).
 *
 * An online multiworld has no placement of its own, so it is judged over that same plain-game
 * world, which is the fullest one the app can build. What it does NOT do is show the plain
 * game's items: the server hands locations over one at a time, so the run says its contents
 * are not known here (randomizer-client/run-kind.ts) and every row shows nothing instead.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { normalPlacement } from '../lib/game/tracker/normal-placement-ref';
import { trackerCheckRecords } from '../lib/game/tracker/tracker-roster';
import { trackerStatuses } from '../lib/game/tracker/tracker-statuses';
import { liveChestItems } from '@shared/game/logic/queries/chest-stand-ins';
import { find } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import {
  buildGroupTree, filterChecks, isListedRow, smallKeyDoorsOf,
} from '@shared/game/logic/queries/check-grouping';
import type {
  FilterState, GroupDimension, RunContext,
} from '@shared/game/logic/queries/check-grouping';
import {
  getCompletedChecks, getCurrentInventory, getEventStatus, onCompletedChecksChanged, onEventStatusChanged, onInventoryChanged,
} from '../lib/game';
import {
  buildPlacementView, firedLocations, getSessionState,
  onFiredLocation, runKindOfSession, subscribeSessionStore,
} from '../lib/game/randomizer-client';
import type { PlacementView } from '../lib/game/randomizer-client';
import type { ViewMode } from '../ui/domains/app/compounds/ChecksTracker';
import { CLOSED_PANELS } from '../ui/domains/app/compounds/ChecksTracker';
import type { TrackerPanels } from '../ui/domains/app/compounds/ChecksTracker';
import { useWidgetPref } from './useWidgetPref';

interface TrackerDataOptions {
  initialGrouping?: GroupDimension[];
  initialViewMode?: ViewMode;
  /**
   * Widget id the view settings belong to. With one, everything the user arranged
   * (grouping, view mode, filter, which panels are open, which groups are expanded)
   * is remembered by the profile and survives the widget being unmounted by an open
   * screen. Without one (the randomizer page's spoiler tab) it is plain local state,
   * as before.
   */
  prefKey?: string;
}

const EMPTY_FILTER: FilterState = { searchQuery: '', activeFacets: [], tagMode: 'any' };
/** Module-level so an unset pref hands back the same array every render, and the
 *  group tree below is not rebuilt on each one. */
const DEFAULT_GROUPING: GroupDimension[] = ['world', 'dungeon'];
const NO_GROUPS: readonly string[] = [];

const useTrackerData = (options: TrackerDataOptions = {}) => {
  const { initialGrouping = DEFAULT_GROUPING, initialViewMode = 'visual', prefKey = null } = options;

  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [eventStatus, setEventStatus] = useState<ReadonlyMap<CheckId, boolean>>(() => new Map(getEventStatus()));
  const [sessionState, setSessionState] = useState(() => getSessionState());
  const [fired, setFired] = useState<ReadonlySet<LocationKey>>(() => firedLocations());
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

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => onEventStatusChanged((status) => setEventStatus(new Map(status))), []);
  useEffect(() => subscribeSessionStore(setSessionState), []);
  useEffect(() => onFiredLocation(() => setFired(new Set(firedLocations()))), []);

  const { placement } = sessionState;
  const runKind = runKindOfSession(sessionState);

  const checkRecords = useMemo(() => find('check', () => true), []);
  // One roster for every surface that lists rows (tracker/tracker-roster.ts): on a seed the
  // locations it generated plus the events, without a placement the dataset's own list.
  const effectiveCheckRecords = useMemo(
    () => trackerCheckRecords(checkRecords, placement),
    [checkRecords, placement],
  );
  const bigKeyDoors = filter.bigKeyDoors ?? true;
  const smallKeyDoors = smallKeyDoorsOf(filter, { kind: runKind });
  const darkRoomsNeedLight = filter.darkRoomsNeedLight ?? true;

  // A status-only row has no "ever" fact of its own: its tick is its live status (story.ts).
  const effectiveCompleted = useMemo(() => {
    const merged = new Set(completedChecks);
    for (const check of checkRecords) if (check.statusOnly && eventStatus.get(check.id)) merged.add(check.id);
    return merged;
  }, [completedChecks, checkRecords, eventStatus]);

  // The one placement the rules answer over: the seed's own, or the one where nothing moved,
  // which is also the fullest world an online session can be judged in, having none of its own.
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

  const placementView: PlacementView = useMemo(() => buildPlacementView(placement), [placement]);
  // A swap chest reads the stand-in once its item is held. Only on the plain game: a seed's
  // chests hold what the seed placed, and online knows none of its contents.
  const liveItems = useMemo(
    () => (runKind === 'normal' ? liveChestItems(checkRecords, inventory, effectiveCompleted) : undefined),
    [runKind, checkRecords, inventory, effectiveCompleted],
  );
  const run: RunContext = useMemo(
    () => (placement
      ? { kind: runKind, placedItems: placementView.itemByCheck, spheres: placementView.sphereByCheck }
      : { kind: runKind, liveItems }),
    [placement, runKind, placementView, liveItems],
  );

  // The totals follow the Items / Events / Both switch and the shelves rule: the summary
  // counts what the list shows (isListedRow), before any search or facet narrows it.
  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0, total = 0;
    for (const check of effectiveCheckRecords) {
      if (!isListedRow(check, filter, run)) continue;
      const status = snapshot.get(check.id);
      total++;
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total };
  }, [snapshot, effectiveCheckRecords, filter, run]);

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
export type { TrackerDataOptions };
