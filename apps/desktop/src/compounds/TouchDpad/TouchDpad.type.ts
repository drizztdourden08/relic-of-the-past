/* @layer renderer-app @kind types */
import type { DpadReading, PxPoint } from '@rotp/input-mapping';

interface TouchDpadProps {
  center: PxPoint;
  /** Half the width of the whole cross. */
  radiusPx: number;
  pressed: DpadReading;
  /** Opacity of the outline, 0.1..1. */
  strength: number;
  selected?: boolean;
}

export type { TouchDpadProps };
