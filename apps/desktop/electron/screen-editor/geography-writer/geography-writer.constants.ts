/* @layer electron-main @kind constants */
import { serializeAreaRecord, serializeLocationRecord } from '@rotp/game-data';
import { areaRecordFile, locationRecordFile } from '@rotp/game-data';
import type { AreaRecord, LocationRecord } from '@rotp/game-data';
import type { RecordWriterSpec } from '../dataset-record-writer';

const AREA_SPEC: RecordWriterSpec<AreaRecord> = {
  kind: 'area',
  recordType: 'AreaRecord',
  target: record => areaRecordFile(record),
  serialize: serializeAreaRecord,
};

const LOCATION_SPEC: RecordWriterSpec<LocationRecord> = {
  kind: 'location',
  recordType: 'LocationRecord',
  target: record => locationRecordFile(record),
  serialize: serializeLocationRecord,
};

export { AREA_SPEC, LOCATION_SPEC };
