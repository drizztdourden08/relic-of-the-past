/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { CHECK_SPEC } from './check-writer.constants';

const deleteCheck = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, CHECK_SPEC, args.id);

export { deleteCheck };
