/* @layer shared-game @kind logic */
import type { FloodFillResult, TransitionPoint } from '@rotp/game-core';
import type { TileReq } from '../tile-attrs';
import { getAttrReq } from '../tile-attrs';

const usableEntranceTransition = (result: FloodFillResult, t: TransitionPoint, items: readonly TileReq[] = result.items ?? []): boolean => {
  if (t.edge !== 'entrance') return false;
  if (t.requirements.some((r) => !items.includes(r as TileReq))) return false;
  const attr = result.attrGrid?.[t.row]?.[t.col];
  if (attr == null) return true;
  const req = getAttrReq(attr, result.indoors);
  return req === undefined || items.includes(req);
};

export { usableEntranceTransition };
