/* @layer bridge-wasm @kind logic */
import type { TileReq } from '@shared/game/navigation/tile-attrs';

const unmetCount = (requirements: readonly string[], items: readonly TileReq[]): number =>
  requirements.filter((req) => !items.includes(req as TileReq)).length;

export { unmetCount };
