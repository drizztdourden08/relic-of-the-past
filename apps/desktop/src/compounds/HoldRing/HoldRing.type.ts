/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface HoldRingProps {
  center: PxPoint;
  progress: number;
  label: string;
}

export type { HoldRingProps };
