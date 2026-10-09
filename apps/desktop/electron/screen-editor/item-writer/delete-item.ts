/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { ITEM_SPEC } from './item-writer.constants';

const deleteItem = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, ITEM_SPEC, args.id);

export { deleteItem };
