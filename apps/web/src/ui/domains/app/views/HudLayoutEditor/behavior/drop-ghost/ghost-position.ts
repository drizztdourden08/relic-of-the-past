/* @layer renderer-components @kind logic */
import { GHOST_EDGE, GHOST_OFFSET } from './drop-ghost.constants';

const ghostPosition = (
  point: { x: number; y: number }, viewport: { w: number; h: number },
): { left: number; top: number; transform: string } => {
  const flipX = viewport.w - point.x < GHOST_EDGE;
  const flipY = viewport.h - point.y < GHOST_EDGE;
  return {
    left: point.x + (flipX ? -GHOST_OFFSET.x : GHOST_OFFSET.x),
    top: point.y + (flipY ? -GHOST_OFFSET.y : GHOST_OFFSET.y),
    transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
  };
};

export { ghostPosition };
