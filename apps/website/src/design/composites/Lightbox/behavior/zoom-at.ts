/* @layer website-site @kind logic */
import type { Point, ZoomState } from '../Lightbox.type';

const zoomAt = (state: ZoomState, cursor: Point, center: Point, scale: number): ZoomState => {
  const ratio = scale / state.scale;
  return {
    scale,
    x: state.x + (cursor.x - center.x) * (1 - ratio),
    y: state.y + (cursor.y - center.y) * (1 - ratio),
  };
};

export { zoomAt };
