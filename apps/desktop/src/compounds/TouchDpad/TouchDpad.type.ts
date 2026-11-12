/* @layer renderer-app @kind types */
import type { DpadReading, PxPoint } from '@rotp/input-mapping';

interface TouchDpadProps {
  center: PxPoint;
  radiusPx: number;
  pressed: DpadReading;
  strength: number;
  selected?: boolean;
}

export type { TouchDpadProps };
