/* @layer shared-game @kind logic */
import type { ScreenPath } from '../../../navigation/types/route.type';
import { gameNumberOf } from './game-number-of';

const toScreenPath = (path: string[]): ScreenPath => ({
  screens: path.map(gameNumberOf),
  crossings: [],
  totalCost: Math.max(0, path.length - 1),
});

export { toScreenPath };
