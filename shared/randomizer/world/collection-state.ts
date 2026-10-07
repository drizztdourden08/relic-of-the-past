/* @layer shared-game @kind logic */
/**
 * Port of the reference generator's collection state as consumed by
 * Archipelago worlds/alttp/StateHelpers.py (python CollectionState:
 * prog_items multiset, has/count/has_any/count_group, reachable-region
 * cache invalidated by every collect/remove). Progressive base items also
 * grant their concrete tier on collect, per Items.py progression_mapping.
 * has/hasAny answer for USABLE items only (item-usability.ts): a
 * meter-consuming item owned on the meter's empty rung reads as absent, so
 * every reference rule that names one is capacity-aware without a rewrite;
 * count/countGroup stay raw, which is what the capacity readings sum.
 *
 * Everything is keyed by ID. An item is its record's id, and an act or a story event is the
 * check that certifies it (events/). A region is its record's id too, so the reachable set
 * reads straight against the collection.
 *
 * The tier ladder a pickup climbs is the world's, not a constant: a seed whose
 * tier ticks left a rung out hands over the next rung that is still there
 * (progressive/progressive-reach.ts). Every rung ticked, which is the default, gives the
 * reference map back unchanged.
 */
import { updateReachableRegions } from './graph';
import { isItemUsable } from './item-usability';
import { progressiveSettingOf, progressiveTierMapOf } from './progressive/progressive-reach';
import type { RegionId } from '@shared/game/data/types/ids';
import type { ItemKey } from './item-ids.data';
import type { ActToken } from './events/event-gate.type';
import type { World } from './world.type';

/** Anything the state can hold: an item, or an act the player has done. */
type Holding = ItemKey | ActToken;

interface CollectionState {
  readonly world: World;
  readonly progItems: Map<Holding, number>;
  readonly reachableRegions: Set<RegionId>;
  staleReachability: boolean;
  has(item: Holding, count?: number): boolean;
  hasAny(items: readonly Holding[]): boolean;
  count(item: Holding): number;
  countGroup(items: readonly Holding[]): number;
  hasGroup(items: readonly Holding[]): boolean;
  collect(item: Holding): void;
  remove(item: Holding): void;
  canReachRegion(region: RegionId): boolean;
}

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
export type { CollectionState, Holding };
