/* @layer renderer-components @kind types */
type GridPos = { row: number; col: number };
type Rect = { x: number; y: number; w: number; h: number };

interface MouseState {
  leftHeld: boolean;
  lockTarget: boolean;
  hoverTile: GridPos | null;
  lockedTile: GridPos | null;
}

interface Props {
  width: number;
  height: number;
  gameRunning: boolean;
}

export type { GridPos, Rect, MouseState, Props };
