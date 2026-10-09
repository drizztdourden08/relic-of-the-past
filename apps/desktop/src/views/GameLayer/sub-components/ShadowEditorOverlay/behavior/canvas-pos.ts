/* @layer renderer-components @kind logic */
import type { Point } from './overlay.type';

const getCanvasPos = (clientX: number, clientY: number, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

export { getCanvasPos };
