/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { ACTOR_SPEC } from './actor-writer.constants';

const deleteActor = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, ACTOR_SPEC, args.id);

export { deleteActor };
