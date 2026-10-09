/* @layer electron-main @kind logic */
import type { AreaRecord } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { AREA_SPEC } from './geography-writer.constants';

const writeAreaRecord = (root: string, args: WriteRecordArgs<AreaRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, AREA_SPEC, args.id, args.record);

export { writeAreaRecord };
