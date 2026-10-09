/* @layer renderer-appshell @kind logic */
import { inventoryToReachTokens } from '@rotp/navigation';
import type { TileReq } from '@rotp/game-data';
import { getCurrentInventory } from '@app/lib/game/tracker';
import { TILE_REQS } from './dump-nav.constants';

const dumpFloodItems = (): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const token of inventoryToReachTokens(getCurrentInventory())) {
    if (TILE_REQS.includes(token)) items.add(token as TileReq);
  }
  return [...items];
};

export { dumpFloodItems };
