/* @layer renderer-components @kind logic */
import type { wasmGetViewportInfo } from '../../../../../../../lib/game';

type Vp = NonNullable<ReturnType<typeof wasmGetViewportInfo>>;
type Point = { x: number; y: number };

/** Current overworld screen index (0–63) from the camera position. */
const screenIdFromVp = (vp: Vp): number => {
  const col = Math.floor((vp.cameraX + 128) / 512) & 7;
  const row = Math.floor((vp.cameraY + 112) / 512) & 7;
  return row * 8 + col;
};

/** Display pixel → world coordinate. */
const displayToWorld = (vp: Vp, width: number, height: number, displayX: number, displayY: number): Point => {
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const viewLeft = vp.cameraX - vp.extraLeftRight;
  const viewTop = vp.cameraY;
  return { x: displayX / scaleX + viewLeft, y: displayY / scaleY + viewTop };
};

/** World coordinate → display pixel. */
const worldToDisplay = (vp: Vp, width: number, height: number, worldX: number, worldY: number): Point => {
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const viewLeft = vp.cameraX - vp.extraLeftRight;
  const viewTop = vp.cameraY;
  return { x: (worldX - viewLeft) * scaleX, y: (worldY - viewTop) * scaleY };
};

/** Mouse client position → canvas-relative pixel. */
const getCanvasPos = (clientX: number, clientY: number, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

export type { Vp, Point };
export { screenIdFromVp, displayToWorld, worldToDisplay, getCanvasPos };
