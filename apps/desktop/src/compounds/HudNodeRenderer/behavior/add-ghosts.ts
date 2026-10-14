/* @layer renderer-hud @kind logic */
import type { PlacedNode } from '@rotp/hud';
import { exitDuration } from './exit-duration';
import type { Ghost } from './hud-node-motion.type';

const addGhosts = (ghosts: readonly Ghost[], departures: readonly PlacedNode[], now: number): readonly Ghost[] => [
  ...ghosts.filter((g) => !departures.some((d) => d.id === g.placed.id)),
  ...departures.map((placed) => ({ placed, removeAt: now + exitDuration(placed) })),
];

export { addGhosts };
