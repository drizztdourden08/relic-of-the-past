/* @layer bridge-wasm @kind logic */
import { SCREEN_PX } from './world-origin.constants';

const overworldOrigin = (screenIndex: number): { x: number; y: number } => ({
  x: (screenIndex & 7) * SCREEN_PX,
  y: ((screenIndex >> 3) & 7) * SCREEN_PX,
});

export { overworldOrigin };
