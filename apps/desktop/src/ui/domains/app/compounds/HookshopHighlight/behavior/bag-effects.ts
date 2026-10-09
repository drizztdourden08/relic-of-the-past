/* @layer renderer-components @kind logic */
import type { BagEffects, HookshopParts, Point } from '../HookshopHighlight.type';
import { SPEED_LINES, STARS } from './bag-effects.constants';
import { placed } from './placed';

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
