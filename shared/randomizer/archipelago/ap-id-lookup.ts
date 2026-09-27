/* @layer shared-game @kind logic */
/**
 * Both directions across the Archipelago id tables (ap-ids.data.ts).
 *
 * An unknown key or id throws. A location or item with no id is one the table was never
 * extended for, and a multiworld cannot carry it, so the caller hears about it at once
 * instead of sending a number the server would drop.
 */
import { AP_ITEM_IDS, AP_LOCATION_IDS } from './ap-ids.data';
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';

const LOCATION_ID_BY_KEY: ReadonlyMap<LocationKey, number> = new Map(
  Object.entries(AP_LOCATION_IDS) as [LocationKey, number][],
);

const ITEM_ID_BY_KEY: ReadonlyMap<ItemKey, number> = new Map(
  Object.entries(AP_ITEM_IDS) as [ItemKey, number][],
);

const LOCATION_KEY_BY_ID: ReadonlyMap<number, LocationKey> = new Map(
  [...LOCATION_ID_BY_KEY].map(([key, id]) => [id, key]),
);

const ITEM_KEY_BY_ID: ReadonlyMap<number, ItemKey> = new Map(
  [...ITEM_ID_BY_KEY].map(([key, id]) => [id, key]),
);

const lookup = <K, V>(table: ReadonlyMap<K, V>, key: K, what: string): V => {
  const value = table.get(key);
  if (value === undefined) throw new Error(`no Archipelago ${what}: ${String(key)}`);
  return value;
};

const apLocationIdOf = (key: LocationKey): number => lookup(LOCATION_ID_BY_KEY, key, 'location id for');

const apItemIdOf = (key: ItemKey): number => lookup(ITEM_ID_BY_KEY, key, 'item id for');

const locationKeyOfApId = (id: number): LocationKey => lookup(LOCATION_KEY_BY_ID, id, 'location has id');

const itemKeyOfApId = (id: number): ItemKey => lookup(ITEM_KEY_BY_ID, id, 'item has id');

export { apItemIdOf, apLocationIdOf, itemKeyOfApId, locationKeyOfApId };
