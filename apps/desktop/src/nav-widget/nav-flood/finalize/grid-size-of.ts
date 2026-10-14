/* @layer renderer-widgets @kind logic */
import { ROOM_SHAPE_GRID, SINGLE_ROOM_GRID } from '../nav-flood.constants';
import type { EffectiveLayout, GridSize, RoomShape } from '../nav-flood.type';

const gridSizeOf = (layout: EffectiveLayout | undefined, shape: RoomShape, hasIntraEdges: boolean): GridSize => {
  if (layout) return { cols: layout.width, rows: layout.height };
  return hasIntraEdges ? ROOM_SHAPE_GRID[shape] : SINGLE_ROOM_GRID;
};

export { gridSizeOf };
