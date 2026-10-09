/* @layer bridge-wasm @kind logic */
import { SCREEN_PX } from './world-origin.constants';

const originContaining = (x: number, y: number): { x: number; y: number } => ({
  x: Math.floor(x / SCREEN_PX) * SCREEN_PX,
  y: Math.floor(y / SCREEN_PX) * SCREEN_PX,
});

export { originContaining };
