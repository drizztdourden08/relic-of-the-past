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
import { useEffect, useMemo, useState } from 'react';
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
  buildPlacementView, computeApTrackerSnapshot, getSessionState, subscribeSessionStore,
} from '../lib/game/randomizer-client';
import type { PlacementView } from '../lib/game/randomizer-client';
import type { ViewMode } from '../ui/domains/app/compounds/ChecksTracker';

interface TrackerDataOptions {
  initialGrouping?: GroupDimension[];
  initialViewMode?: ViewMode;
}

const EMPTY_FILTER: FilterState = { searchQuery: '', activeFacets: [], tagMode: 'any' };

const useTrackerData = (options: TrackerDataOptions = {}) => {
  const { initialGrouping = ['world', 'dungeon'], initialViewMode = 'compact' } = options;

  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [placement, setPlacement] = useState(() => getSessionState().placement);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [grouping, setGrouping] = useState<GroupDimension[]>(initialGrouping);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => subscribeSessionStore((state) => setPlacement(state.placement)), []);

  const checkRecords = useMemo(() => find('check', () => true), []);
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
    () => (placement ? computeApTrackerSnapshot(placement, completedChecks, checkRecords) : null),
    [placement, completedChecks, checkRecords],
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
    () => filterChecks(checkRecords, filter, snapshot, run),
    [checkRecords, filter, snapshot, run],
  );
  const groupTree = useMemo(
    () => buildGroupTree(filteredChecks, snapshot, grouping, run),
    [filteredChecks, snapshot, grouping, run],
  );

  return {
    viewMode, setViewMode,
    grouping, setGrouping,
    filter, setFilter,
    snapshot, stats, groupTree,
    placement, placementView, run,
  };
};

export { useTrackerData };
export type { TrackerDataOptions };
