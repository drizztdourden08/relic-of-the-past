/* @layer bridge-wasm @kind logic */
import { getAttrReq } from '@shared/game/navigation/tile-attrs';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult } from '@shared/game/navigation';
import type { TransitionPoint } from '@rotp/game-core';
import { unmetCount } from './unmet-count';

const approachRequirements = (result: FloodFillResult, t: TransitionPoint): string[] => {
  const asked = new Set<string>(t.requirements);
  const attr = result.attrGrid?.[t.row]?.[t.col];
  const attrReq = attr == null ? undefined : getAttrReq(attr, result.indoors);
  if (attrReq !== undefined) asked.add(attrReq);
  return [...asked];
};

const cheapestApproach = (items: readonly TileReq[]) => (best: string[], approach: string[]): string[] => {
  const unmet = unmetCount(approach, items);
  const bestUnmet = unmetCount(best, items);
  if (unmet !== bestUnmet) return unmet < bestUnmet ? approach : best;
  return approach.length < best.length ? approach : best;
};

const entranceRequirements = (
  result: FloodFillResult,
  entranceId: number,
  items: readonly TileReq[] = result.items ?? [],
): string[] => {
  const approaches = result.transitions
    .filter((t) => t.edge === 'entrance' && t.entranceIdx === entranceId)
    .map((t) => approachRequirements(result, t));
  if (approaches.length === 0) return [];
  return approaches.reduce(cheapestApproach(items));
};

export { entranceRequirements };
