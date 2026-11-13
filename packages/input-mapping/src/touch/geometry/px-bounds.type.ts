/* @layer shared-input @kind types */
import type { PxPoint } from '../touch-logic.type';

interface PxBounds {
  center: PxPoint;
  halfW: number;
  halfH: number;
}

export type { PxBounds };
