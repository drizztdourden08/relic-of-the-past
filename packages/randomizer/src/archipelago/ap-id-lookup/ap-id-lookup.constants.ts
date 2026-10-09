/* @layer shared-game @kind constants */
import { AP_ITEM_IDS, AP_LOCATION_IDS } from '../ap-ids.constants';
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';

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

export { ITEM_ID_BY_KEY, ITEM_KEY_BY_ID, LOCATION_ID_BY_KEY, LOCATION_KEY_BY_ID };
