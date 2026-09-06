/* @layer shared-game @kind logic */
/**
 * The real fill accounting of a snapshot: every number comes from the
 * FillWorld the generator itself builds (fill-world.ts), never from a
 * second bookkeeping: locations in the world, the spots an item can sit
 * in, the ones open to the fill, the items the fill will place (global pool
 * plus the dungeon sets, equal to the open count by the fill invariant), the
 * spots settled before the shuffle, and the locations locked to their
 * vanilla item. Pure: no rng, since the mentor-check assurance runs with a fixed
 * picker so the count matches what the generator will do, and the bottle
 * and filler picks are deterministic, so it is cheap enough for a live
 * panel.
 */
import { capacityPlansOf } from '../capacity/family-plan';
import { buildFillWorld, fillEligibleLocations } from '../fill/fill-world';
import { fillOptionsFromSnapshot } from '../fill/fill-options-from-snapshot';
import { fillerCountOf } from './balance-filler';
import type { DeliverableSets } from '../fill/fill-options-from-snapshot';
import type { FillWorld } from '../fill/fill-world.type';
import type { RandomizerOptionsSnapshot } from '../options.type';

/** Deterministic stand-in for the generator's rng picker; the count is the same whichever weapon leaves. */
const firstChoice = (choices: readonly string[]): string => choices[0];

interface PoolAccounting {
  /** Every location of the world, events and prizes included. */
  locations: number;
  /**
   * Every location an item can sit in, not an event slot, not a prize slot.
   * The ceiling of the fill; a new kind of spot (grass, pots) raises it.
   */
  spots: number;
  /** Locations the fill may place into. */
  open: number;
  /** Global pool + dungeon sets, which equals `open` by the fill invariant. */
  items: number;
  /** Spots settled before the shuffle: the locked vanilla items plus the assured starting weapon. */
  fixed: number;
  /** Locations pre-placed with their vanilla item and excluded from the fill. */
  lockedVanilla: number;
  /** Filler items still in the global pool (what more upgrades could displace). */
  filler: number;
  /** The capacity families' items in the global pool: each one took a filler's place. */
  upgrades: number;
}

/** The items the profile's family plans put in the pool, by name, the meter's row included. */
const planItemsOf = (fillWorld: FillWorld): ReadonlySet<string> =>
  new Set(Object.values(capacityPlansOf(fillWorld.capacity, fillWorld.capacityProgressive)).flatMap((plan) => plan.items));

const accountingOf = (snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets): PoolAccounting => {
  const fillWorld = buildFillWorld(fillOptionsFromSnapshot(snapshot, deliverable, { pickWeapon: firstChoice }));
  const { world, pool } = fillWorld;
  const dungeon = [...pool.dungeonItems.values()].reduce((sum, items) => sum + items.length, 0);
  const spots = [...world.locationsByName.values()].filter((location) => !location.event && !location.prize);
  const planItems = planItemsOf(fillWorld);
  return {
    locations: world.locationsByName.size,
    spots: spots.length,
    open: fillEligibleLocations(fillWorld).length,
    items: pool.pool.length + dungeon,
    fixed: spots.filter((location) => world.placedItems.has(location.name)).length,
    lockedVanilla: fillWorld.lockedVanilla.size,
    filler: fillerCountOf(pool.pool),
    upgrades: pool.pool.filter((name) => planItems.has(name)).length,
  };
};

export { accountingOf };
export type { PoolAccounting };
