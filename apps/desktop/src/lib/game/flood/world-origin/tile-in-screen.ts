/* @layer bridge-wasm @kind logic */
import { TILE_PX } from './world-origin.constants';

const tileInScreen = (x: number, y: number, origin: { x: number; y: number }): { row: number; col: number } => ({
  row: Math.floor((y - origin.y) / TILE_PX),
  col: Math.floor((x - origin.x) / TILE_PX),
});

export { tileInScreen };
