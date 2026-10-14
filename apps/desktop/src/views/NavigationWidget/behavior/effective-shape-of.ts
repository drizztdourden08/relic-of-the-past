/* @layer renderer-widgets @kind logic */
import type { RoomLayoutInfo } from '../../../game';
import { ROOM_SHAPE_GRID } from '../../../nav-widget/nav-flood/nav-flood.constants';

const effectiveShapeOf = (layout: RoomLayoutInfo): string => {
  const base = ROOM_SHAPE_GRID[layout.shape];
  const width = layout.quadrantFullsizeX > 0 ? 2 : base.cols;
  const height = layout.quadrantFullsizeY > 0 ? 2 : base.rows;
  return `${width}×${height}`;
};

export { effectiveShapeOf };
