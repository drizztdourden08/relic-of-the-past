/* @layer renderer-components @kind logic */
import type { PartName, PlacedPart, Point, Rect } from '../HookshopHighlight.type';

const placed = <P extends PartName>(part: P, rect: Rect, angle = 0, origin: Point = [rect.width / 2, rect.height / 2]): PlacedPart<P> =>
  ({ part, ...rect, angle, originX: origin[0], originY: origin[1] });

export { placed };
