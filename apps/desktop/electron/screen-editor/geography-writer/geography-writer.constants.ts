/* @layer electron-main @kind constants */
import { serializeAreaRecord, serializeLocationRecord } from '@shared/game/data/record-codegen';
import { areaRecordFile, locationRecordFile } from '@shared/game/data/record-file-targets';
import type { AreaRecord, LocationRecord } from '@shared/game/data/types';
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
