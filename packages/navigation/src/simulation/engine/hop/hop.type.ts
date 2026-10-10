/* @layer shared-game @kind types */
import type { SimExit } from '../../types';
import type { ScreenEdge } from '../traversal/traversal.type';

interface HopLink {
  exit: SimExit | undefined;
  edge: ScreenEdge | undefined;
}

export type { HopLink };
