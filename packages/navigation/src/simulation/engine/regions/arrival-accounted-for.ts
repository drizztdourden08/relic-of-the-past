/* @layer shared-game @kind logic */
import type { SimExit } from '../../types';
import type { RegionProgress, RegionReachMap } from './regions.type';
import { arrivalKey } from './arrival-key';
import { crossingKey } from './crossing-key';
import { regionCovered } from './region-covered';

const arrivalAccountedFor = (
  progress: Pick<RegionProgress, 'arrivals' | 'crossings'>,
  map: RegionReachMap,
  exit: SimExit,
  from?: string,
): boolean => {
  const { arrivals, crossings } = progress;
  if (arrivals.has(arrivalKey(exit.to, exit.edgeSig))) return true;
  if (crossings && from) {
    const key = crossingKey(from, exit.to, exit.edgeSig);
    if (key && crossings.has(key)) return true;
  }
  return regionCovered(map, exit.to, exit.entryTile);
};

export { arrivalAccountedFor };
