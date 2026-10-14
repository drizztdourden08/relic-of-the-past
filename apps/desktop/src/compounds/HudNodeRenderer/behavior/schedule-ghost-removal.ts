/* @layer renderer-hud @kind logic */
import type { PlacedNode } from '@rotp/hud';
import { exitDuration } from './exit-duration';
import type { Ghost } from './hud-node-motion.type';

const scheduleGhostRemoval = (
  placed: PlacedNode,
  setGhosts: (update: (prev: readonly Ghost[]) => readonly Ghost[]) => void,
): ReturnType<typeof setTimeout> =>
  setTimeout(() => setGhosts((prev) => prev.filter((g) => g.placed.id !== placed.id)), exitDuration(placed));

export { scheduleGhostRemoval };
