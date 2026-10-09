/* @layer electron-main @kind logic */
import type { LocationRecord } from '@shared/game/data/types';
import type { WriteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { LOCATION_SPEC } from './geography-writer.constants';

const writeLocationRecord = (root: string, args: WriteRecordArgs<LocationRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, LOCATION_SPEC, args.id, args.record);

export { writeLocationRecord };
