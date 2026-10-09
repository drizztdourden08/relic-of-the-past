/* @layer electron-main @kind logic */
import type { ItemRecord } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@shared/ipc/screen-editor-contract';
import { createRecord } from '../dataset-record-writer';
import { ITEM_SPEC } from './item-writer.constants';

const allocateItem = (
  root: string,
  args: AllocateRecordArgs<ItemRecord>,
): Promise<AllocateRecordResult<ItemRecord>> => createRecord(root, ITEM_SPEC, args.record);

export { allocateItem };
