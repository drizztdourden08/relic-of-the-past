/* @layer electron-main @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { CHECK_SPEC } from './check-writer.constants';

const writeCheckRecord = (root: string, args: WriteRecordArgs<CheckRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, CHECK_SPEC, args.id, args.record);

export { writeCheckRecord };
