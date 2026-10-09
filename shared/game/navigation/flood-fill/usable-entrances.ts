/* @layer shared-game @kind logic */
import type { FloodFillResult, OverworldEntrance } from '@rotp/game-core';
import type { TileReq } from '../tile-attrs';
import { isEntranceUsable } from './is-entrance-usable';

const usableEntrances = (result: FloodFillResult, items: readonly TileReq[] = result.items ?? []): OverworldEntrance[] =>
  result.entrances.filter((e) => isEntranceUsable(result, e, items));

export { usableEntrances };
