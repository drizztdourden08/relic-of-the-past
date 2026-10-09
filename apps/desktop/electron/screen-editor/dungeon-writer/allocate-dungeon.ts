/* @layer electron-main @kind logic */
import type { DungeonRecord } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@shared/ipc/screen-editor-contract';
import { createRecord } from '../dataset-record-writer';
import { DUNGEON_SPEC } from './dungeon-writer.constants';

const allocateDungeon = (
  root: string,
  args: AllocateRecordArgs<DungeonRecord>,
): Promise<AllocateRecordResult<DungeonRecord>> => createRecord(root, DUNGEON_SPEC, args.record);

export { allocateDungeon };
