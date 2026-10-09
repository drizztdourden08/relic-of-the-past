/* @layer renderer-widgets @kind logic */
import type { ScreenSpawn } from '@shared/game/data';

const spawnKey = (spawn: ScreenSpawn): string => `${spawn.actorId}@${spawn.tile.x},${spawn.tile.y}`;

export { spawnKey };
