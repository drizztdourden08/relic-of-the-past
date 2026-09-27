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
import { widestRuledWorld } from '@shared/randomizer/archipelago/export/widest-world';
import { createCollectionState } from '@shared/randomizer/world/collection-state';
import { canCollectLocation } from '@shared/randomizer/world/rules/collect';
import { sweepPlacementSpheres } from '@shared/randomizer/world/fill/verify-placement';
import { accessibilityFailures } from '@shared/randomizer/world/accessibility/accessibility-check';
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

const replayForward = (fillWorld: FillWorld, spoiler: ApSpoiler): ForwardVerdict => {
  const { world } = fillWorld;
  const unknown: string[] = [];
  world.placedItems.clear();
  for (const [location, item] of spoiler.placements) {
    const locationKey = keyOf(LOCATION_KEY, location, unknown);
    const itemKey = keyOf(ITEM_KEY, item, unknown);
    if (locationKey !== undefined && itemKey !== undefined) world.placedItems.set(locationKey, itemKey);
  }
  for (const [location, item] of fillWorld.pool.eventItems) world.placedItems.set(location, item);
  const state = createCollectionState(world);
  const sphereMisses: string[] = [];
  for (const sphere of spoiler.spheres) {
    const keys = sphere.map(([location]) => keyOf(LOCATION_KEY, location, unknown));
    for (const [index, key] of keys.entries()) {
      if (key !== undefined && !canCollectLocation(state, key)) sphereMisses.push(sphere[index][0]);
    }
    for (const [, item] of sphere) {
      const itemKey = keyOf(ITEM_KEY, item, unknown);
      if (itemKey !== undefined) state.collect(itemKey);
    }
  }
  const sweep = sweepPlacementSpheres(world);
  const unreachable = accessibilityFailures({
    mode: 'full', capacity: fillWorld.capacity, uncollected: sweep.uncollected, placedItems: world.placedItems,
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
  const skip = new Set<string>([...Object.keys(model.events), ...Object.keys(model.prizes.vanilla)]);
  const locked = Object.fromEntries(Object.entries(placement.locations).filter(([location]) => !skip.has(location)));
  const prizes = Object.fromEntries(Object.keys(model.prizes.vanilla).map((slot) => [slot, placement.locations[slot as LocationKey]]));
  const world = {
    ...model, locked, dungeonItems: [], pool: {}, prizes: { ...model.prizes, shuffle: false, vanilla: prizes },
  };
  return renderPlayerYaml({ slotName: 'Oracle', options: snapshot, seedText: seed, preRolled: { ...preRolled, world } });
};

export { replayForward, reversePlayerYaml };
export type { ForwardVerdict };
