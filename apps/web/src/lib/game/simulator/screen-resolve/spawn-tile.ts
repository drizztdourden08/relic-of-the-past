/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { wasmGetEntranceSpawns } from '../../';
import { roomOrigin, tileInScreen } from '../../flood/world-origin';
import { GRID } from './screen-resolve.constants';

const spawnTile = (entranceId: number, destRoom: number): GridPos | undefined => {
  const spawn = wasmGetEntranceSpawns()?.[entranceId];
  if (!spawn) return undefined;
  const { row, col } = tileInScreen(spawn.x, spawn.y, roomOrigin(destRoom));
  return row >= 0 && row < GRID && col >= 0 && col < GRID ? { row, col } : undefined;
};

export { spawnTile };
