/* @layer bridge-wasm @kind logic */
import { getItem } from '@rotp/game-data';
import { RECEIVE_CROSSING_WORLD_IDS } from './standing-override-key.constants';
import { isWorldItemKind } from './is-world-item-kind';
import type { CheckRecord } from '@rotp/game-data';

const worldGrantReceiveIdOf = (check: CheckRecord): number | undefined => {
  if (!isWorldItemKind(check)) return undefined;
  const vanillaItem = check.vanillaItemIds[0];
  if (vanillaItem === undefined) return undefined;
  const receiveId = getItem(vanillaItem).gameId?.receiveItemId;
  if (receiveId === undefined || !RECEIVE_CROSSING_WORLD_IDS.has(receiveId)) return undefined;
  return receiveId;
};

export { worldGrantReceiveIdOf };
