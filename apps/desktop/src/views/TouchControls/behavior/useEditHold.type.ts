/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface ActiveHold {
  pointerId: number;
  origin: PxPoint;
  startedAt: number;
}

export type { ActiveHold };
