/* @layer electron-main @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@app/ipc/screen-editor-contract';
import { createRecord } from '../dataset-record-writer';
import { CHECK_SPEC } from './check-writer.constants';

const allocateCheck = (
  root: string,
  args: AllocateRecordArgs<CheckRecord>,
): Promise<AllocateRecordResult<CheckRecord>> => createRecord(root, CHECK_SPEC, args.record);

export { allocateCheck };
