/* @layer electron-main @kind constants */
import { serializeItemRecord, itemRecordFile } from '@rotp/game-data';
import type { ItemRecord } from '@rotp/game-data';
import type { RecordWriterSpec } from '../dataset-record-writer';

const ITEM_SPEC: RecordWriterSpec<ItemRecord> = {
  kind: 'item',
  recordType: 'ItemRecord',
  target: record => itemRecordFile(record),
  serialize: serializeItemRecord,
};

export { ITEM_SPEC };
