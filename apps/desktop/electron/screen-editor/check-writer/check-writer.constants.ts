/* @layer electron-main @kind constants */
import { serializeCheckRecord, checkRecordFile } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import type { RecordWriterSpec } from '../dataset-record-writer';

const CHECK_SPEC: RecordWriterSpec<CheckRecord> = {
  kind: 'check',
  recordType: 'CheckRecord',
  target: record => checkRecordFile(record),
  serialize: serializeCheckRecord,
};

export { CHECK_SPEC };
