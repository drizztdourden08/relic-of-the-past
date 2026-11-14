/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface TouchStickProps {
  base: PxPoint;
  knob: PxPoint;
  radiusPx: number;
  strength: number;
  active: boolean;
}

export type { TouchStickProps };
