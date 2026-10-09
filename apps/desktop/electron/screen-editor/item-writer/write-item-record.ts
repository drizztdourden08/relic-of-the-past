/* @layer electron-main @kind logic */
import type { ItemRecord } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { ITEM_SPEC } from './item-writer.constants';

const writeItemRecord = (root: string, args: WriteRecordArgs<ItemRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, ITEM_SPEC, args.id, args.record);

export { writeItemRecord };
