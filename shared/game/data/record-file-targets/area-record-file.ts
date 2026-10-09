/* @layer shared-game @kind logic */
import type { AreaRecord } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { worldFolder } from './world-folder';

const areaRecordFile = (area: Pick<AreaRecord, 'world'>): FileTarget =>
  ({ relativePath: `areas/${worldFolder(area.world)}.ts` });

export { areaRecordFile };
