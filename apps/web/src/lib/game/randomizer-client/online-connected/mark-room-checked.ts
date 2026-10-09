/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { OnlineContext } from '../online-context.type';

const markRoomChecked = (ctx: OnlineContext, locationIds: Iterable<number>): void => {
  const keys: LocationKey[] = [];
  for (const id of locationIds) {
    const key = ctx.maps.keyByLocationId.get(id);
    if (key !== undefined) keys.push(key);
  }
  if (keys.length > 0) ctx.core.markCollected(keys);
};

export { markRoomChecked };
