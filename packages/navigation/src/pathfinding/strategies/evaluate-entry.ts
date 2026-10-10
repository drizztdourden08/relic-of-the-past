/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import type { EntryContext } from './layer-strategy';
import { canLeaveLedge } from './can-leave-ledge';

const withRequirement = (requirements: Set<string>, req: string): Set<string> => {
  if (requirements.has(req)) return requirements;
  const next = new Set(requirements);
  next.add(req);
  return next;
};

const evaluateEntry = (tile: TilePassability, entry: EntryContext): { canEnter: boolean; newReqs: Set<string> } => {
  const { dr, dc, requirements, inventory } = entry;
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
