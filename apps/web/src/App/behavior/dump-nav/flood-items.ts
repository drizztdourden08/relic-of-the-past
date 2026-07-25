/* @layer renderer-appshell @kind logic */
/**
 * The player's real traversal tokens, for the `--dump-nav` flood.
 *
 * The dump used to flood with an EMPTY inventory, so it reported fewer reachable
 * tiles than the widget for the very same room (590 vs 608 in the Jail Cell) and
 * a baseline captured from it could not be compared with anything. It now floods
 * with what the player actually carries, from the same tracker the simulator reads.
 *
 * `lift.1` is always present: bare-handed lifting needs no item.
 */
import { inventoryToReachTokens } from '@shared/game/simulation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { getCurrentInventory } from '../../../lib/game/tracker';

/** Traversal tokens the flood understands; other reach tokens are irrelevant here. */
const TILE_REQS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot'];

const dumpFloodItems = (): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const token of inventoryToReachTokens(getCurrentInventory())) {
    if (TILE_REQS.includes(token)) items.add(token as TileReq);
  }
  return [...items];
};

export { dumpFloodItems };
