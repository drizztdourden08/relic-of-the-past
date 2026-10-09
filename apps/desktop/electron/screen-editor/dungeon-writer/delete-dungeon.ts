/* @layer electron-main @kind logic */
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { deleteRecord } from '../dataset-record-writer';
import { DUNGEON_SPEC } from './dungeon-writer.constants';

const deleteDungeon = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, DUNGEON_SPEC, args.id);

export { deleteDungeon };
