/* @layer bridge-wasm @kind logic */
import { ROOMS_PER_ROW, SCREEN_PX } from './world-origin.constants';

const roomOrigin = (roomId: number): { x: number; y: number } => ({
  x: (roomId % ROOMS_PER_ROW) * SCREEN_PX,
  y: Math.floor(roomId / ROOMS_PER_ROW) * SCREEN_PX,
});

export { roomOrigin };
