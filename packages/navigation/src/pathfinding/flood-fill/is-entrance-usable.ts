/* @layer shared-game @kind logic */
import type { FloodFillResult, OverworldEntrance } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { usableEntranceTransition } from './usable-entrance-transition';

const isEntranceUsable = (result: FloodFillResult, entrance: OverworldEntrance, items: readonly TileReq[] = result.items ?? []): boolean =>
  result.transitions.some((t) => t.entranceIdx === entrance.id && usableEntranceTransition(result, t, items));

export { isEntranceUsable };
