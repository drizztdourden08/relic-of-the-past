/* @layer shared-game @kind logic */
import type { TileReq } from '../tile-attrs';

const unmetRequirements = (requirements: string[], inventory: Set<TileReq>): string[] => {
  return requirements.filter(r => !inventory.has(r as TileReq));
};

export { unmetRequirements };
