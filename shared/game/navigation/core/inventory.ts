/* @layer shared-game @kind logic */
import type { TilePassability } from '../types';
import type { TileReq } from '../tile-attrs';

const canPass = (tile: TilePassability, inventory: Set<TileReq>): boolean => {
  switch (tile.type) {
    case 'free':
    case 'pit':
      return true;
    case 'obstacle':
      return inventory.has(tile.req as TileReq);
    case 'water':
      return inventory.has('flippers');
    case 'ledge':
    case 'blocked':
      return false;
  }
};

const isPassableForClearance = (tile: TilePassability, inventory: Set<TileReq>): boolean => {
  if (tile.type === 'free' || tile.type === 'pit') return true;
  if (tile.type === 'obstacle') return inventory.has(tile.req as TileReq);
  if (tile.type === 'water') return inventory.has('flippers');
  return false;
};

const unmetRequirements = (requirements: string[], inventory: Set<TileReq>): string[] => {
  return requirements.filter(r => !inventory.has(r as TileReq));
};

export { canPass, isPassableForClearance, unmetRequirements };
