/* @layer shared-input @kind logic */
import type { StickDirection } from './stick-direction.type';

const dragDirection = (dx: number, dy: number, threshold: number): StickDirection | null => {
  if (Math.hypot(dx, dy) < threshold) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
};

export { dragDirection };
