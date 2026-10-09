/* @layer shared-game @kind logic */
import type { TileAttrDef, TileCat } from '@rotp/game-data';

const attrsOfCat = (map: Readonly<Record<number, TileAttrDef>>, cat: TileCat): ReadonlySet<number> => {
  const s = new Set<number>();
  for (const [k, v] of Object.entries(map)) {
    if (v.cat === cat) s.add(Number(k));
  }
  return s;
};

export { attrsOfCat };
