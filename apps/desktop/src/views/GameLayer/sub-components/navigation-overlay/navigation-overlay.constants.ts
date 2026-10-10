/* @layer renderer-components @kind constants */
const ENTRANCE_COLOR = '#ffcc44';

const EDGE_COLORS: Partial<Record<string, string>> = {
  north: '#4488ff',
  south: '#44ff88',
  east: '#ff8844',
  west: '#bb44ff',
  entrance: ENTRANCE_COLOR,
};

export { EDGE_COLORS, ENTRANCE_COLOR };
