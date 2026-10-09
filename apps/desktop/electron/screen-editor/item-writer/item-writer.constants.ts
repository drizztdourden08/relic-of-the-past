/* @layer electron-main @kind constants */
import { serializeItemRecord } from '@shared/game/data/record-codegen';
import { itemRecordFile } from '@shared/game/data/record-file-targets';
import type { ItemRecord } from '@shared/game/data/types';
import type { RecordWriterSpec } from '../dataset-record-writer';

const ITEM_SPEC: RecordWriterSpec<ItemRecord> = {
  kind: 'item',
  recordType: 'ItemRecord',
  target: record => itemRecordFile(record),
  serialize: serializeItemRecord,
};

export { ITEM_SPEC };
