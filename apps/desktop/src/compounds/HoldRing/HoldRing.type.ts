/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface HoldRingProps {
  center: PxPoint;
  /** How far the hold has come, 0..1. */
  progress: number;
}

export type { HoldRingProps };
