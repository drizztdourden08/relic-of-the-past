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

interface FrameBox {
  w: number;
  h: number;
  inset: number;
}

export type { CornerPlacement, FrameBox, GroundShape };
