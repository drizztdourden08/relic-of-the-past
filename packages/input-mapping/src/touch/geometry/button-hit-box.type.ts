/* @layer shared-input @kind types */
import type { PxPoint } from '../touch-logic.type';

interface ButtonHitBox {
  center: PxPoint;
  halfW: number;
  halfH: number;
  round: boolean;
}

export type { ButtonHitBox };
