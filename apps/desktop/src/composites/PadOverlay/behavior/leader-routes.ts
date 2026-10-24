/* @layer renderer-components @kind logic */
import { GLYPH_REACH, LEADER_GAP } from '../PadOverlay.constants';
import type { PlacedPart, Point } from '../PadOverlay.type';

const routeFrom = (part: PlacedPart, path: readonly Point[]): Point[] | null => {
  const [centre, next, ...rest] = path;
  if (!centre || !next) return null;
  const reach = part.radius * GLYPH_REACH[part.slot.kind] + LEADER_GAP;
  const length = Math.hypot(next.x - centre.x, next.y - centre.y);
  if (length <= reach + 1) return null;
  const start = { x: centre.x + ((next.x - centre.x) / length) * reach, y: centre.y + ((next.y - centre.y) / length) * reach };
  return [start, next, ...rest];
};

const leaderRoutes = (part: PlacedPart, attach: Point): Point[][] => {
  const centre = { x: part.x, y: part.y };
  const paths = [
    [centre, attach],
    [centre, { x: centre.x, y: attach.y }, attach],
    [centre, { x: attach.x, y: centre.y }, attach],
  ];
  return paths.flatMap((path) => {
    const route = routeFrom(part, path);
    return route ? [route] : [];
  });
};

export { leaderRoutes };
