/* @layer bridge-wasm @kind logic */
import { SUB_SCREEN } from './overworld-entrances.constants';
import type { SubScreenPos } from './overworld-entrances.type';

const resolveToSubScreen = (heads: Uint8Array | null, area: number, bigRow: number, bigCol: number): SubScreenPos => {
  if (heads?.[area] !== area) return { area, gridRow: bigRow, gridCol: bigCol };
  const isBig = heads.some((h, i) => h === area && i !== area);
  if (!isBig || (bigRow < SUB_SCREEN && bigCol < SUB_SCREEN)) return { area, gridRow: bigRow, gridCol: bigCol };
  const subRow = bigRow >= SUB_SCREEN ? 1 : 0;
  const subCol = bigCol >= SUB_SCREEN ? 1 : 0;
  return {
    area: ((((area >> 3) & 7) + subRow) << 3) | ((area & 7) + subCol),
    gridRow: bigRow - subRow * SUB_SCREEN,
    gridCol: bigCol - subCol * SUB_SCREEN,
  };
};

export { resolveToSubScreen };
