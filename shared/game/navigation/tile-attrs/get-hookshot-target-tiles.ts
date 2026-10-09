/* @layer shared-game @kind logic */
import { tileAttrsFor } from './tile-attrs-for';

const getHookshotTargetTiles = (indoors = false): ReadonlySet<number> => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(tileAttrsFor(indoors))) {
    if (v.hookTarget) s.add(Number(k));
  }
  return s;
};

export { getHookshotTargetTiles };
