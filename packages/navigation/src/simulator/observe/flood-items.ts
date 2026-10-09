/* @layer bridge-wasm @kind logic */
import type { EngineState } from '../../simulation';
import type { TileReq } from '@rotp/game-data';
import { TILE_REQS } from './observe.constants';

const floodItems = (state: EngineState): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const t of state.reachTokens) if (TILE_REQS.includes(t)) items.add(t as TileReq);
  return [...items];
};

export { floodItems };
