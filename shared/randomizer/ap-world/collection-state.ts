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
 * The tier ladder a pickup climbs is the world's, not a constant: a seed whose
 * tier ticks left a rung out hands over the next rung that is still there
 * (progressive/progressive-reach.ts). Every rung ticked — the default, and what
 * a world built before the rows existed reads as — gives the reference map back
 * unchanged.
 */
import { updateReachableRegions } from './graph';
import { isItemUsable } from './item-usability';
import { progressiveSettingOf, progressiveTierMapOf } from './progressive/progressive-reach';
import type { ApWorld } from './world.type';

interface CollectionState {
  readonly world: ApWorld;
  readonly progItems: Map<string, number>;
  readonly reachableRegions: Set<string>;
  staleReachability: boolean;
  has(name: string, count?: number): boolean;
  hasAny(names: readonly string[]): boolean;
  count(name: string): number;
  countGroup(names: readonly string[]): number;
  hasGroup(names: readonly string[]): boolean;
  collect(name: string): void;
  remove(name: string): void;
  canReachRegion(name: string): boolean;
}

const createCollectionState = (world: ApWorld): CollectionState => {
  const progItems = new Map<string, number>();
  const tiersByItem = progressiveTierMapOf(progressiveSettingOf(world));

  const add = (name: string, delta: number): void => {
    const next = (progItems.get(name) ?? 0) + delta;
    if (next <= 0) progItems.delete(name);
    else progItems.set(name, next);
  };

  const state: CollectionState = {
    world,
    progItems,
    reachableRegions: new Set<string>(),
    staleReachability: true,

    count: (name) => progItems.get(name) ?? 0,
    has: (name, count = 1) => (progItems.get(name) ?? 0) >= count && isItemUsable(state, name),
    hasAny: (names) => names.some((name) => (progItems.get(name) ?? 0) > 0 && isItemUsable(state, name)),
    countGroup: (names) => names.reduce((sum, name) => sum + (progItems.get(name) ?? 0), 0),
    hasGroup: (names) => names.some((name) => (progItems.get(name) ?? 0) > 0),

    collect: (name) => {
      add(name, 1);
      const tiers = tiersByItem.get(name);
      if (tiers) {
        const rank = Math.min(progItems.get(name) ?? 0, tiers.length);
        if (rank > 0) add(tiers[rank - 1], 1);
      }
      state.staleReachability = true;
    },

    remove: (name) => {
      const tiers = tiersByItem.get(name);
      if (tiers) {
        const rank = Math.min(progItems.get(name) ?? 0, tiers.length);
        if (rank > 0) add(tiers[rank - 1], -1);
      }
      add(name, -1);
      state.staleReachability = true;
    },

    canReachRegion: (name) => {
      updateReachableRegions(state, world);
      return state.reachableRegions.has(name);
    },
  };

  return state;
};

export { createCollectionState };
export type { CollectionState };
