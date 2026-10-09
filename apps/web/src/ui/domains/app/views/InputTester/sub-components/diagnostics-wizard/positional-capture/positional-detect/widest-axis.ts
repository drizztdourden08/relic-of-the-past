/* @layer renderer-components @kind logic */
import { AXIS_TRAVEL_THRESHOLD } from '../positional-capture.constants';
import type { AxisRanges } from '../positional-capture.type';

const widestAxis = (ranges: AxisRanges): number | null => {
  let best = -1;
  let bestTravel = 0;
  for (let i = 0; i < ranges.length; i++) {
    const travel = ranges[i].max - ranges[i].min;
    if (travel > bestTravel) { bestTravel = travel; best = i; }
  }
  return bestTravel >= AXIS_TRAVEL_THRESHOLD ? best : null;
};

export { widestAxis };
