/* @layer bridge-wasm @kind logic */
import { reachableNear } from '../../flood/annotate/reachability';
import { unmetCount } from './unmet-count';
import type { Availability, AvailabilityArgs } from './availability.type';

const crossingAvailability = ({ tile, requirements = [], reachable, items }: AvailabilityArgs): Availability => {
  const withinReach = reachable ? reachableNear(reachable, tile.row, tile.col) : true;
  return { available: unmetCount(requirements, items) === 0 && withinReach, requirements };
};

export { crossingAvailability };
