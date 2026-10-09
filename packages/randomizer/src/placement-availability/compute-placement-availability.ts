/* @layer shared-game @kind logic */
import { computePlacementReach } from './compute-placement-reach';

const computePlacementAvailability = (
  ...args: Parameters<typeof computePlacementReach>
): Set<string> => computePlacementReach(...args).available;

export { computePlacementAvailability };
