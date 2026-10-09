/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { AREA_SPEC } from './geography-writer.constants';

const deleteArea = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, AREA_SPEC, args.id);

export { deleteArea };
