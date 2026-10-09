/* @layer electron-main @kind constants */
import { serializeCheckRecord } from '@shared/game/data/record-codegen';
import { checkRecordFile } from '@shared/game/data/record-file-targets';
import type { CheckRecord } from '@shared/game/data/types';
import type { RecordWriterSpec } from '../dataset-record-writer';

const CHECK_SPEC: RecordWriterSpec<CheckRecord> = {
  kind: 'check',
  recordType: 'CheckRecord',
  target: record => checkRecordFile(record),
  serialize: serializeCheckRecord,
};

export { CHECK_SPEC };
