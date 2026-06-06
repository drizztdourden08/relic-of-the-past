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

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff',
  south: '#44ff88',
  east: '#ff8844',
  west: '#bb44ff',
  entrance: '#ffcc44',
};

export { EDGE_COLORS };
export type { GridPos, Rect, MouseState, Props };
