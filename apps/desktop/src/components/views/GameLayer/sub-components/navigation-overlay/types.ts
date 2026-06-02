export type GridPos = { row: number; col: number };
export type Rect = { x: number; y: number; w: number; h: number };

export interface MouseState {
  leftHeld: boolean;
  lockTarget: boolean;
  hoverTile: GridPos | null;
  lockedTile: GridPos | null;
}

export interface Props {
  width: number;
  height: number;
  gameRunning: boolean;
}

export const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff',
  south: '#44ff88',
  east: '#ff8844',
  west: '#bb44ff',
  entrance: '#ffcc44',
};
