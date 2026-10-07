/* @layer renderer-components @kind logic */
/**
 * The motion effects around the bag, placed from points on the bag itself so they follow
 * it whatever its angle. Two stars sit off its top-right and bottom-right corners and are
 * drawn behind it. Three speed lines start just off its right side, bright end first, and
 * fan out as they trail away opposite to the pull.
 */
import type { HookshopParts, PlacedPart, Point } from '../HookshopHighlight.type';
import { placed } from './plane-geometry';

/** Star centres, in bag pixels. */
const STARS: Point[] = [[81, 15], [64, 102]];
/** Where each line starts, in bag pixels, and how far it fans from the trail, in degrees. */
const SPEED_LINES: { from: Point; spread: number }[] = [
  { from: [73.5, 36], spread: -13 },
  { from: [78, 57], spread: -9 },
  { from: [80, 80], spread: -1 },
];

type BagEffects = { stars: PlacedPart<'star'>[]; speedLines: PlacedPart<'speedLine'>[] };

/** `onBag` turns a bag pixel into a scene point; `trail` is the angle the lines run at before they fan. */
const bagEffects = (parts: HookshopParts, onBag: (p: Point) => Point, trail: number): BagEffects => {
  const { star, speedLine: line } = parts;
  const stars = STARS.map((p) => {
    const [x, y] = onBag(p);
    return placed('star', x - star.w / 2, y - star.h / 2, star.w, star.h);
  });
  const speedLines = SPEED_LINES.map(({ from, spread }) => {
    const [x, y] = onBag(from);
    return placed('speedLine', x - line.w, y - line.h / 2, line.w, line.h, trail + spread, [line.w, line.h / 2]);
  });
  return { stars, speedLines };
};

export { bagEffects };
