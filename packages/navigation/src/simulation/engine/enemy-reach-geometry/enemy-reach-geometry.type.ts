/* @layer shared-game @kind types */
import type { ScreenGridBundle } from '../../types';

interface FiringScene {
  reached: boolean[][] | undefined;
  bundle: ScreenGridBundle | undefined;
  collisionTable: number[] | undefined;
}

export type { FiringScene };
