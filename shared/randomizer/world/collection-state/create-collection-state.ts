/* @layer shared-game @kind logic */
import { updateReachableRegions } from '../update-reachable-regions';
import { isItemUsable } from '../item-usability';
import { progressiveSettingOf, progressiveTierMapOf } from '../progressive/progressive-reach';
import type { RegionId } from '@shared/game/data/types/ids';
import type { World } from '../world.type';
import type { CollectionState, Holding } from '../collection-state.type';

const createCollectionState = (world: World): CollectionState => {
  const progItems = new Map<Holding, number>();
  const tiersByItem = progressiveTierMapOf(progressiveSettingOf(world));
  const add = (item: Holding, delta: number): void => {
    const next = (progItems.get(item) ?? 0) + delta;
    if (next <= 0) progItems.delete(item);
    else progItems.set(item, next);
  };
  const state: CollectionState = {
    world,
    progItems,
    reachableRegions: new Set<RegionId>(),
    staleReachability: true,
    count: (item) => progItems.get(item) ?? 0,
    has: (item, count = 1) => (progItems.get(item) ?? 0) >= count && isItemUsable(state, item),
    hasAny: (items) => items.some((item) => (progItems.get(item) ?? 0) > 0 && isItemUsable(state, item)),
    countGroup: (items) => items.reduce((sum, item) => sum + (progItems.get(item) ?? 0), 0),
    hasGroup: (items) => items.some((item) => (progItems.get(item) ?? 0) > 0),
    collect: (item) => {
      add(item, 1);
      const tiers = tiersByItem.get(item);
      if (tiers) {
        const rank = Math.min(progItems.get(item) ?? 0, tiers.length);
        if (rank > 0) add(tiers[rank - 1], 1);
      }
      state.staleReachability = true;
    },
    remove: (item) => {
      const tiers = tiersByItem.get(item);
      if (tiers) {
        const rank = Math.min(progItems.get(item) ?? 0, tiers.length);
        if (rank > 0) add(tiers[rank - 1], -1);
      }
      add(item, -1);
      state.staleReachability = true;
    },
    canReachRegion: (region) => {
      updateReachableRegions(state, world);
      return state.reachableRegions.has(region);
    },
  };
  return state;
};

export { createCollectionState };
