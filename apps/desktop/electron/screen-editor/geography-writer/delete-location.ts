/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { LOCATION_SPEC } from './geography-writer.constants';

const deleteLocation = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, LOCATION_SPEC, args.id);

export { deleteLocation };
