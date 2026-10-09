/* @layer shared-game @kind types */
interface PoseQuad {
  off: number;
  dx: number;
  dy: number;
  flipX: boolean;
  flipY: boolean;
}

interface PoseFrame {
  slot: number;
  quads: readonly PoseQuad[];
}

interface PoseState {
  action: number;
  perFacing: boolean;
  frames: Record<string, readonly number[]>;
}

interface PoseBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PoseAtlas {
  note: string;
  sheetCols: number;
  tileBytes: number;
  rowStride: number;
  quadSize: number;
  bounds: PoseBounds;
  frames: readonly PoseFrame[];
  states: readonly PoseState[];
}

type Facing = 0 | 1 | 2 | 3;

interface PoseCanvasSize {
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export type { Facing, PoseAtlas, PoseBounds, PoseCanvasSize, PoseFrame, PoseQuad, PoseState };
