/* @layer electron-main @kind logic */
import type { DungeonRecord } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { DUNGEON_SPEC } from './dungeon-writer.constants';

const writeDungeonRecord = (root: string, args: WriteRecordArgs<DungeonRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, DUNGEON_SPEC, args.id, args.record);

export { writeDungeonRecord };
