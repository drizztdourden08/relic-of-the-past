/* @layer renderer-widgets @kind constants */
import { BADGE, BORDER_W, FRAME_LEFT, FRAME_TOP, MAP_SIZE } from './IndoorMinimap.constants';

const INDOOR_EDGE_OFFSETS = {
  north: FRAME_TOP - BADGE + BORDER_W,
  south: FRAME_TOP + MAP_SIZE + BORDER_W,
  west: FRAME_LEFT - BADGE + BORDER_W,
  east: FRAME_LEFT + MAP_SIZE + BORDER_W,
};

export { INDOOR_EDGE_OFFSETS };
