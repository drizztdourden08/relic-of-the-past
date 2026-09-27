/* @layer bridge-wasm @kind logic */
import { getAttrReq } from '@shared/game/navigation/tile-attrs';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult, GridPos } from '@shared/game/navigation';
import type { ReachState, TransitionPoint } from '@shared/game/navigation/types';
import { reachableNear } from '../flood/annotate/reachability';

interface AvailabilityArgs {
  tile: GridPos;
  requirements?: readonly string[];
  reachable?: readonly ReachState[][];
  items: readonly TileReq[];
}

interface Availability {
  available: boolean;
  requirements: readonly string[];
}

/** One approach to an entrance: what the transition asks, plus its tile's gate. */
const approachRequirements = (result: FloodFillResult, t: TransitionPoint): string[] => {
  const asked = new Set<string>(t.requirements);
  const attr = result.attrGrid?.[t.row]?.[t.col];
  const attrReq = attr == null ? undefined : getAttrReq(attr, result.indoors);
  if (attrReq !== undefined) asked.add(attrReq);
  return [...asked];
};

const unmetCount = (requirements: readonly string[], items: readonly TileReq[]): number =>
  requirements.filter((req) => !items.includes(req as TileReq)).length;

/**
 * What this entrance asks for by its CHEAPEST approach.
 *
 * An entrance is usable as soon as ONE of its transitions is (`isEntranceUsable`
 * is a `.some`), so a plain-floor approach beside a glove-gated one asks for
 * nothing. Unioning every approach instead demands the player hold all of them
 * at once, which reports a walkable entrance as blocked.
 */
const entranceRequirements = (
  result: FloodFillResult,
  entranceId: number,
  items: readonly TileReq[] = result.items ?? [],
): string[] => {
  const approaches = result.transitions
    .filter((t) => t.edge === 'entrance' && t.entranceIdx === entranceId)
    .map((t) => approachRequirements(result, t));
  if (approaches.length === 0) return [];
  return approaches.reduce((best, approach) => {
    const unmet = unmetCount(approach, items);
    const bestUnmet = unmetCount(best, items);
    if (unmet !== bestUnmet) return unmet < bestUnmet ? approach : best;
    return approach.length < best.length ? approach : best;
  });
};

/**
 * The verdict for one crossing: it must be within reach of the flood AND ask
 * for nothing the player lacks. A flood that was never run cannot judge reach,
 * so the crossing reads available on its requirements alone.
 */
const crossingAvailability = ({ tile, requirements = [], reachable, items }: AvailabilityArgs): Availability => {
  const withinReach = reachable ? reachableNear(reachable, tile.row, tile.col) : true;
  return { available: unmetCount(requirements, items) === 0 && withinReach, requirements };
};

export { crossingAvailability, entranceRequirements };
export type { Availability, AvailabilityArgs };
