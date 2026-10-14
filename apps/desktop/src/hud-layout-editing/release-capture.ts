/* @layer renderer-components @kind logic */
import type { Armed } from './drag-gesture.type';

const releaseCapture = (held: Armed | null): void => {
  if (held?.target.hasPointerCapture?.(held.pointerId)) held.target.releasePointerCapture?.(held.pointerId);
};

export { releaseCapture };
