/* @layer renderer-components @kind constants */
const AXIS_LEN = 48;
const ARROW_SIZE = 8;
const HANDLE_RADIUS = 5;
const CROSS_SIZE = 8;
const CROSS_OFFSET = 0.55;
const UNIFORM_OFFSET = 0.7;
const ROTATE_OFFSET = 1.3;
const CENTER_RADIUS = 7;
const VERTEX_RADIUS = 4;
const RADIUS_HANDLE_DIST = 16;
const DIAGONAL_UNIT = 0.707;
const AXIS_HIT_HALF_WIDTH = 6;

const CURSOR_MAP: Record<string, string> = {
  'move-x': 'e-resize',
  'move-y': 'n-resize',
  'move-center': 'move',
  'resize-x': 'ew-resize',
  'resize-y': 'ns-resize',
  'resize-uniform': 'nwse-resize',
  'rotate': 'grab',
};

export {
  AXIS_LEN, ARROW_SIZE, HANDLE_RADIUS, CROSS_SIZE, CROSS_OFFSET, UNIFORM_OFFSET, ROTATE_OFFSET, CENTER_RADIUS,
  VERTEX_RADIUS, RADIUS_HANDLE_DIST, DIAGONAL_UNIT, AXIS_HIT_HALF_WIDTH, CURSOR_MAP,
};
