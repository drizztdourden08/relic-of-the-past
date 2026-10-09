/* @layer shared-game @kind types */
interface CornerPlacement {
  x: number;
  y: number;
  sx: 1 | -1;
  sy: 1 | -1;
}

interface GroundShape {
  borderRadius?: number;
  clipPath?: string;
}

export type { CornerPlacement, GroundShape };
