/* @layer renderer-app @kind types */
import type { PxPoint } from '@rotp/input-mapping';

interface PxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MovementGeometry {
  zone: PxRect | null;
  centre: PxPoint | null;
  radiusPx: number;
}

export type { MovementGeometry };
