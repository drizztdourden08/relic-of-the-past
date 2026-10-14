/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { displayToWorld } from './display-to-world';
import { getCanvasPos } from './canvas-pos';
import { screenIdFromVp } from './screen-id-from-vp';
import type { HandlerDeps, PointerContext } from './overlay.type';

const pointerContext = (d: HandlerDeps, e: MouseEvent): PointerContext | null => {
  const canvas = d.canvasRef.current;
  const vp = d.vpRef.current;
  if (!canvas || !vp) return null;
  const pos = getCanvasPos(e.clientX, e.clientY, canvas);
  const view = { vp, width: d.width, height: d.height };
  return { vp, pos, world: displayToWorld(view, pos.x, pos.y), screenId: screenIdFromVp(vp) };
};

export { pointerContext };
