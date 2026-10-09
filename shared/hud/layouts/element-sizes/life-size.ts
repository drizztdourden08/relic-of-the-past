/* @layer shared-hud @kind logic */
import { HEART_SIZE, HEARTS_PER_ROW, LIFE_SIZE } from './element-sizes.constants';
import type { Size } from '../geometry.type';

const lifeSize = (hearts: number): Size => ({
  w: LIFE_SIZE.w,
  h: Math.max(1, Math.ceil(hearts / HEARTS_PER_ROW)) * HEART_SIZE,
});

export { lifeSize };
