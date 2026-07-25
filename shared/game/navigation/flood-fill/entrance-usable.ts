/* @layer shared-game @kind logic */
/**
 * Whether a flooded entrance is one Link can actually USE.
 *
 * Reaching an entrance's transition is not enough: the tile it sits on may still
 * demand an item Link doesn't hold (the classic case is a staircase buried under
 * a rock that needs the Power Glove — flooded, visible, and not usable). The
 * simulator applied this test; the widget, minimaps and overlay each carried a
 * weaker copy that only asked "did any transition mention this entrance id?", so
 * they advertised entrances the flood itself considered unusable.
 */
import type { FloodFillResult, OverworldEntrance, TransitionPoint } from '../types';
import type { TileReq } from '../tile-attrs';
import { getAttrReq } from '../tile-attrs';

/** True when this transition is a usable entrance for the given inventory. */
const usableEntranceTransition = (result: FloodFillResult, t: TransitionPoint, items: readonly TileReq[] = result.items ?? []): boolean => {
  if (t.edge !== 'entrance') return false;
  if (t.requirements.some((r) => !items.includes(r as TileReq))) return false;
  const attr = result.attrGrid?.[t.row]?.[t.col];
  if (attr == null) return true;
  const req = getAttrReq(attr, result.tileContext);
  return req === undefined || items.includes(req);
};

/** True when `entrance` has at least one usable transition in this flood. */
const isEntranceUsable = (result: FloodFillResult, entrance: OverworldEntrance, items: readonly TileReq[] = result.items ?? []): boolean =>
  result.transitions.some((t) => t.entranceIdx === entrance.id && usableEntranceTransition(result, t, items));

/** The entrances of this flood Link can actually use. */
const usableEntrances = (result: FloodFillResult, items: readonly TileReq[] = result.items ?? []): OverworldEntrance[] =>
  result.entrances.filter((e) => isEntranceUsable(result, e, items));

export { isEntranceUsable, usableEntrances, usableEntranceTransition };
