/* @layer shared-game @kind logic */
import { getArea } from '../facade';
import type { LocationRecord } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { worldFolder } from './world-folder';

const locationRecordFile = (location: Pick<LocationRecord, 'areaId'>): FileTarget => {
  const area = getArea(location.areaId);
  return { relativePath: `locations/${worldFolder(area.world)}.ts` };
};

export { locationRecordFile };
