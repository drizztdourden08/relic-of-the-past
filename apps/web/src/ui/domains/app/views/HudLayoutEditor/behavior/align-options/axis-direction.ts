/* @layer renderer-components @kind logic */
import type { FlowDirection } from './align-options.type';

const axisDirection = (
  axis: 'main' | 'cross', direction: FlowDirection,
): FlowDirection => {
  if (axis === 'main') return direction;
  return direction === 'row' ? 'column' : 'row';
};

export { axisDirection };
