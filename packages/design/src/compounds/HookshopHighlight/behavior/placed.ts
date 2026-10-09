/* @layer renderer-components @kind logic */
import type { PartName, PlacedPart, Point } from '../HookshopHighlight.type';

const placed = <P extends PartName>(part: P, left: number, top: number, width: number, height: number, angle = 0, origin: Point = [width / 2, height / 2]): PlacedPart<P> =>
  ({ part, left, top, width, height, angle, originX: origin[0], originY: origin[1] });

export { placed };
