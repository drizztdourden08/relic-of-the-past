/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { spawnLandingTile, tileInScreen } from '../../flood/world-origin';
import { inGrid } from './in-grid';
import { clampToGrid } from './clamp-to-grid';

const spawnCrossingTile = (spawn: { x: number; y: number }, origin: { x: number; y: number }): GridPos | null => {
  if (!inGrid(tileInScreen(spawn.x, spawn.y, origin))) return null;
  return clampToGrid(spawnLandingTile(spawn.x, spawn.y, origin));
};

export { spawnCrossingTile };
