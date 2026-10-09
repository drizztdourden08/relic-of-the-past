/* @layer shared-game @kind logic */
import type { TilePassability } from '../types';
import { canLeaveLedge } from './can-leave-ledge';

const withRequirement = (requirements: Set<string>, req: string): Set<string> => {
  if (requirements.has(req)) return requirements;
  const next = new Set(requirements);
  next.add(req);
  return next;
};

const evaluateEntry = (tile: TilePassability, dr: number, dc: number, requirements: Set<string>, inventory: Set<string>): { canEnter: boolean; newReqs: Set<string> } => {
  switch (tile.type) {
    case 'free':
    case 'pit':
    case 'stairs':
      return { canEnter: true, newReqs: requirements };

    case 'obstacle':
      if (!inventory.has(tile.req)) return { canEnter: false, newReqs: requirements };
      return { canEnter: true, newReqs: withRequirement(requirements, tile.req) };

    case 'water':
      if (!inventory.has('flippers')) return { canEnter: false, newReqs: requirements };
      return { canEnter: true, newReqs: withRequirement(requirements, 'flippers') };

    case 'ledge':
      return { canEnter: canLeaveLedge(tile.dir, dr, dc), newReqs: requirements };

    case 'blocked':
      return { canEnter: false, newReqs: requirements };
  }
};

export { evaluateEntry };
