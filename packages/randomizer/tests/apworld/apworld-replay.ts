/* @layer tests @kind helper */
import { renderPlayerYaml } from '../../src/archipelago/player-yaml';
import { preRolledOfFillWorld } from '../../src/archipelago/pre-rolled';
import { exportItems } from '../../src/archipelago/export/export-items';
import { exportLocations } from '../../src/archipelago/export/export-locations';
import { exportRegions } from '../../src/archipelago/export/export-regions';
import { canReachEvent } from '../../src/world/events/event-sweep';
import { widestRuledWorld } from '../../src/archipelago/export/widest-ruled-world';
import { createCollectionState } from '../../src/world/collection-state';
import { canCollectLocation } from '../../src/world/rules/collect';
import { sweepPlacementSpheres } from '../../src/world/fill/verify-placement';
import { accessibilityFailures } from '../../src/world/accessibility/accessibility-check';
import type { CheckId } from '@rotp/game-data';
import type { CollectionState } from '../../src/world/collection-state';
import type { FillWorld } from '../../src/world/fill/fill-world.type';
import type { Placement } from '../../src/world/fill/placement.type';
import type { ItemKey } from '../../src/world/item-ids';
import type { LocationKey } from '../../src/world/location-key';
import type { RandomizerOptionsSnapshot } from '../../src/world/options.type';
import type { ApSpoiler } from './ap-spoiler';

const LOCATIONS = exportLocations(widestRuledWorld());
const ITEMS = exportItems();
const LOCATION_KEY = new Map(LOCATIONS.map((row) => [row.name, row.key as LocationKey]));
const ITEM_KEY = new Map(ITEMS.map((row) => [row.name, row.key as ItemKey]));
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

const reachedIn = (state: CollectionState, name: string, unknown: string[]): boolean => {
  const event = EVENT_KEY.get(name);
  if (event !== undefined) return canReachEvent(state, event);
  const key = keyOf(LOCATION_KEY, name, unknown);
  return key === undefined || canCollectLocation(state, key);
};

const placeSpoilerItems = (world: FillWorld['world'], spoiler: ApSpoiler, unknown: string[]): void => {
  world.placedItems.clear();
  for (const [location, item] of spoiler.placements) {
    if (EVENT_KEY.has(location)) continue;
    const locationKey = keyOf(LOCATION_KEY, location, unknown);
    const itemKey = keyOf(ITEM_KEY, item, unknown);
    if (locationKey !== undefined && itemKey !== undefined) world.placedItems.set(locationKey, itemKey);
  }
};

const walkSpheres = (state: CollectionState, spoiler: ApSpoiler, unknown: string[]): string[] => {
  const sphereMisses: string[] = [];
  for (const sphere of spoiler.spheres) {
    for (const [location] of sphere) {
      if (!reachedIn(state, location, unknown)) sphereMisses.push(location);
    }
    for (const [location, item] of sphere) {
      const itemKey = EVENT_KEY.get(location) ?? keyOf(ITEM_KEY, item, unknown);
      if (itemKey !== undefined) state.collect(itemKey);
    }
  }
  return sphereMisses;
};

const replayForward = (fillWorld: FillWorld, spoiler: ApSpoiler): ForwardVerdict => {
  const { world } = fillWorld;
  const unknown: string[] = [];
  placeSpoilerItems(world, spoiler, unknown);
  const sphereMisses = walkSpheres(createCollectionState(world), spoiler, unknown);
  const sweep = sweepPlacementSpheres(world);
  const unreachable = accessibilityFailures({
    mode: 'full', capacity: fillWorld.capacity, uncollected: sweep.uncollected, missedEvents: sweep.missedEvents,
    placedItems: world.placedItems,
  });
  return { unknown, sphereMisses, unreachable, beaten: sweep.beaten };
};

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
