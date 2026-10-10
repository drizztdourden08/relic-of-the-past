/* @layer shared-game @kind logic */
import { inBounds } from '../../core/in-bounds';

const bodyFits = (r: number, c: number, ok: (rr: number, cc: number) => boolean): boolean => {
  const bodies: [number, number][] = [[r, c], [r - 1, c], [r, c - 1], [r - 1, c - 1]];
  for (const [br, bc] of bodies) {
    if (!inBounds(br, bc) || !inBounds(br + 1, bc + 1)) continue;
    if (ok(br, bc) && ok(br, bc + 1) && ok(br + 1, bc) && ok(br + 1, bc + 1)) return true;
  }
  return false;
};

export { bodyFits };
