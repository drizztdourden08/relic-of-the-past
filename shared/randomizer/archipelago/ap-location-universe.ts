/* @layer shared-game @kind logic */
/**
 * Every location the world can ever declare, under any option.
 *
 * The widest world is built once: key drops on, every pond rung of every pond present, and
 * every shelf slot opened at the deepest restock. Each seed row of the collection and every
 * shelf key at every depth are added on top, so a row an option would hide still counts.
 *
 * Event locations are left out. Archipelago gives an event location no numeric id (its
 * address is None), because it only ever holds a locked event item the server never sees.
 */
import { all } from '@shared/game/data';
import { buildWorld } from '../world/build-world';
import { POND_REGION_LOCATIONS } from '../world/pond/pond-region-locations';
import { EVENT_LOCATIONS } from '../world/scope-tables';
import { isSeedLocation } from '../world/seed-locations';
import { ALL_SHOP_SLOT_LOCATIONS } from '../world/shops/shop-slots';
import { compareApKeys } from './ap-key-order';
import { widestWorldOptions } from './export/widest-world';
import type { LocationKey } from '../world/location-key';

const widestWorldKeys = (): readonly LocationKey[] => [...buildWorld(widestWorldOptions()).locationsByKey.keys()];

/** The whole location set, events excluded, in natural key order. */
const apLocationUniverse = (): readonly LocationKey[] => {
  const keys = new Set<LocationKey>([
    ...widestWorldKeys(),
    ...all('check').filter(isSeedLocation).map((check) => check.id),
    ...ALL_SHOP_SLOT_LOCATIONS.keys(),
    ...[...POND_REGION_LOCATIONS.values()].flat(),
  ]);
  return [...keys].filter((key) => !EVENT_LOCATIONS.has(key)).sort(compareApKeys);
};

export { apLocationUniverse };
