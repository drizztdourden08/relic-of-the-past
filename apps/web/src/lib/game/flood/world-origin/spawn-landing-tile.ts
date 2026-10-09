/* @layer bridge-wasm @kind logic */
import { SPAWN_FEET_COLS, SPAWN_FEET_ROWS } from './world-origin.constants';
import { tileInScreen } from './tile-in-screen';

const spawnLandingTile = (x: number, y: number, origin: { x: number; y: number }): { row: number; col: number } => {
  const spriteTopLeft = tileInScreen(x, y, origin);
  return { row: spriteTopLeft.row + SPAWN_FEET_ROWS, col: spriteTopLeft.col + SPAWN_FEET_COLS };
};

export { spawnLandingTile };
