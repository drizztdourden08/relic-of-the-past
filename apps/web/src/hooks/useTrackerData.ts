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
 * Reachability depends on the session kind. A vanilla profile evaluates the
 * hand-authored rule set as before. A randomized profile evaluates the ported
 * rule engine over the frozen placement instead: collected placed items,
 * standard-mode escape gating and per-dungeon key counts included, because
 * the vanilla dataset models neither the seed nor the escape sequence.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules } from '@shared/game/logic/resolver';
import { VANILLA_CONFIG } from '@shared/game/data/presets';
import { find } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import { buildGroupTree, filterChecks } from '@shared/game/logic/queries/check-grouping';
import type {
  FilterState, GroupDimension, RunContext,
} from '@shared/game/logic/queries/check-grouping';
import {
  getCompletedChecks, getCurrentInventory, onCompletedChecksChanged, onInventoryChanged,
} from '../lib/game';
import {
  apAlignedCheckRecords, buildPlacementView, computeApTrackerSnapshot, firedLocations, getSessionState,
  onFiredLocation, subscribeSessionStore,
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
  const { initialGrouping = DEFAULT_GROUPING, initialViewMode = 'compact', prefKey = null } = options;

  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [placement, setPlacement] = useState(() => getSessionState().placement);
  const [fired, setFired] = useState<ReadonlySet<string>>(() => firedLocations());
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
  useEffect(() => subscribeSessionStore((state) => setPlacement(state.placement)), []);
  useEffect(() => onFiredLocation(() => setFired(new Set(firedLocations()))), []);

  const checkRecords = useMemo(() => find('check', () => true), []);
  // Every AP location this seed placed an item at, real checks plus the ones no
  // CheckRecord backs (shop slots at whatever depth this seed opened, chiefly),
  // so the widget's total always matches what the generator actually produced.
  // Vanilla profiles carry no placement, so this is just checkRecords for them.
  const effectiveCheckRecords = useMemo(
    () => (placement ? apAlignedCheckRecords(checkRecords, placement) : checkRecords),
    [checkRecords, placement],
  );
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);

  const vanillaSnapshot = useMemo(
    () => computeTrackerSnapshot(effectiveInventory, completedChecks, checkRecords, resolvedLogic.connections, resolvedLogic.checkOverrides),
    [effectiveInventory, completedChecks, checkRecords, resolvedLogic],
  );
  const apSnapshot = useMemo(
    () => (placement ? computeApTrackerSnapshot(placement, completedChecks, effectiveCheckRecords, fired) : null),
    [placement, completedChecks, effectiveCheckRecords, fired],
  );
  const snapshot = apSnapshot ?? vanillaSnapshot;

  const placementView: PlacementView = useMemo(() => buildPlacementView(placement), [placement]);
  const run: RunContext | undefined = useMemo(
    () => (placement
      ? { placedItems: placementView.itemByCheck, spheres: placementView.sphereByCheck }
      : undefined),
    [placement, placementView],
  );

  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total: snapshot.size };
  }, [snapshot]);

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
    snapshot, stats, groupTree,
    placement, placementView, run,
  };
};

export { useTrackerData };
export type { TrackerDataOptions };
