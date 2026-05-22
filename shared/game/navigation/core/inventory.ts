import type { TilePassability } from '../types';

/** Check if a tile is passable given the current inventory. */
export function canPass(tile: TilePassability, inventory: Set<string>): boolean {
  switch (tile.type) {
    case 'free':
    case 'pit':
      return true;
    case 'obstacle':
      return inventory.has(tile.req);
    case 'water':
      return inventory.has('flippers');
    case 'ledge':
    case 'blocked':
      return false;
  }
}

/** Check if a tile blocks 2-tile width clearance. */
export function isPassableForClearance(tile: TilePassability, inventory: Set<string>): boolean {
  if (tile.type === 'free' || tile.type === 'pit') return true;
  if (tile.type === 'obstacle') return inventory.has(tile.req);
  if (tile.type === 'water') return inventory.has('flippers');
  return false;
}

/** Filter requirements list against inventory, returning only unmet ones. */
export function unmetRequirements(requirements: string[], inventory: Set<string>): string[] {
  return requirements.filter(r => !inventory.has(r));
}
