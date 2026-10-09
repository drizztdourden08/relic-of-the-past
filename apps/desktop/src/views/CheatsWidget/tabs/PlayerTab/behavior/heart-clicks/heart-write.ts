/* @layer renderer-widgets @kind logic */
import { HALF_HEART, HEART_UNITS } from '../../PlayerTab.constants';
import type { HeartButton, HeartWrite } from '../../PlayerTab.type';

const heartWrite = (cell: number, leftHalf: boolean, button: HeartButton, capacity: number): HeartWrite => {
  const containers = (cell + 1) * HEART_UNITS;
  if (button === 2) return { capacity: containers };
  const owned = containers <= capacity;
  const units = containers - (leftHalf && owned ? HALF_HEART : 0);
  if (units > capacity) return { capacity: containers, health: units };
  return { health: units };
};

export { heartWrite };
