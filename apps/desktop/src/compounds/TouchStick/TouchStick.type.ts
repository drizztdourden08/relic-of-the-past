/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface TouchStickProps {
  /** Centre of the outer ring. */
  base: PxPoint;
  /** Centre of the knob. */
  knob: PxPoint;
  /** Radius of the outer ring. */
  radiusPx: number;
  /** Opacity of the ring and knob, 0.1..1. */
  strength: number;
  /** A thumb is on the stick. */
  active: boolean;
}

export type { TouchStickProps };
