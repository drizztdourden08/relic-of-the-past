/* @layer tests @kind helper */
/**
 * Both directions of the apworld oracle, on the TypeScript side.
 *
 * Forward: an Archipelago spoiler's placement loaded into the fill world the profile's seed
 * builds, then every playthrough sphere asked of our rules with only the items of the spheres
 * before it, and the whole placement swept for the goal and full accessibility.
 *
 * Reverse: one of our own placements written as a player file whose every fillable location
 * is locked to its item, so Archipelago's fill has nothing left to decide and its beatability
 * and accessibility checks judge our placement with the package's rules.
 */
import { renderPlayerYaml } from '@shared/randomizer/archipelago/player-yaml';
import { preRolledOfFillWorld } from '@shared/randomizer/archipelago/pre-rolled';
import { exportItems } from '@shared/randomizer/archipelago/export/export-items';
import { exportLocations } from '@shared/randomizer/archipelago/export/export-locations';
import { exportRegions } from '@shared/randomizer/archipelago/export/export-regions';
import { canReachEvent } from '@shared/randomizer/world/events/event-sweep';
import { widestRuledWorld } from '@shared/randomizer/archipelago/export/widest-world';
import { createCollectionState } from '@shared/randomizer/world/collection-state';
import { canCollectLocation } from '@shared/randomizer/world/rules/collect';
import { sweepPlacementSpheres } from '@shared/randomizer/world/fill/verify-placement';
import { accessibilityFailures } from '@shared/randomizer/world/accessibility/accessibility-check';
import type { CheckId } from '@shared/game/data/types/ids';
import type { CollectionState } from '@shared/randomizer/world/collection-state';
import type { FillWorld } from '@shared/randomizer/world/fill/fill-world.type';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { ApSpoiler } from './ap-spoiler';

const LOCATIONS = exportLocations(widestRuledWorld());
const ITEMS = exportItems();
const LOCATION_KEY = new Map(LOCATIONS.map((row) => [row.name, row.key as LocationKey]));
const ITEM_KEY = new Map(ITEMS.map((row) => [row.name, row.key as ItemKey]));
/** A story event's name, which Archipelago gives both its event location and its event item. */
const EVENT_KEY = new Map(exportRegions(widestRuledWorld()).events.map((row) => [row.name, row.key as CheckId]));

interface ForwardVerdict {
  unknown: string[];
  sphereMisses: string[];
  unreachable: string[];
  beaten: boolean;
}

const keyOf = <V>(table: ReadonlyMap<string, V>, name: string, unknown: string[]): V | undefined => {
  const key = table.get(name);
  if (key === undefined) unknown.push(name);
  return key;
};

/** Whether a spoiler's sphere entry is in reach: its story event, or its location. An unknown name is reported, not a miss. */
const reachedIn = (state: CollectionState, name: string, unknown: string[]): boolean => {
  const event = EVENT_KEY.get(name);
  if (event !== undefined) return canReachEvent(state, event);
  const key = keyOf(LOCATION_KEY, name, unknown);
  return key === undefined || canCollectLocation(state, key);
};

const replayForward = (fillWorld: FillWorld, spoiler: ApSpoiler): ForwardVerdict => {
  const { world } = fillWorld;
  const unknown: string[] = [];
  world.placedItems.clear();
  // A story event is an Archipelago event: a spoiler may list it, but it holds nothing to place.
  for (const [location, item] of spoiler.placements) {
    if (EVENT_KEY.has(location)) continue;
    const locationKey = keyOf(LOCATION_KEY, location, unknown);
    const itemKey = keyOf(ITEM_KEY, item, unknown);
    if (locationKey !== undefined && itemKey !== undefined) world.placedItems.set(locationKey, itemKey);
  }
  const state = createCollectionState(world);
  const sphereMisses: string[] = [];
  for (const sphere of spoiler.spheres) {
    for (const [location] of sphere) {
      if (!reachedIn(state, location, unknown)) sphereMisses.push(location);
    }
    for (const [location, item] of sphere) {
      const event = EVENT_KEY.get(location);
      const itemKey = event ?? keyOf(ITEM_KEY, item, unknown);
      if (itemKey !== undefined) state.collect(itemKey);
    }
  }
  const sweep = sweepPlacementSpheres(world);
  const unreachable = accessibilityFailures({
    mode: 'full', capacity: fillWorld.capacity, uncollected: sweep.uncollected, missedEvents: sweep.missedEvents,
    placedItems: world.placedItems,
  });
  return { unknown, sphereMisses, unreachable, beaten: sweep.beaten };
};

/**
 * A player file whose world model locks every fillable location to what `placement` put there,
 * so Archipelago's fill has nothing left to decide. Plando would do the same job but places
 * each item against an assumed state of its own, which refuses self-locking key spots our fill
 * reached in another order; locking judges only the finished placement.
 */
const reversePlayerYaml = (
  seed: string, snapshot: RandomizerOptionsSnapshot, fillWorld: FillWorld, placement: Placement,
): string => {
  const preRolled = preRolledOfFillWorld(fillWorld, snapshot);
  const model = preRolled.world;
  const skip = new Set<string>(Object.keys(model.prizes.vanilla));
  const locked = Object.fromEntries(Object.entries(placement.locations).filter(([location]) => !skip.has(location)));
  const prizes = Object.fromEntries(Object.keys(model.prizes.vanilla).map((slot) => [slot, placement.locations[slot as LocationKey]]));
  const world = {
    ...model, locked, dungeonItems: [], pool: {}, prizes: { ...model.prizes, shuffle: false, vanilla: prizes },
  };
  return renderPlayerYaml({ slotName: 'Oracle', options: snapshot, seedText: seed, preRolled: { ...preRolled, world } });
};

export { replayForward, reversePlayerYaml };
export type { ForwardVerdict };
