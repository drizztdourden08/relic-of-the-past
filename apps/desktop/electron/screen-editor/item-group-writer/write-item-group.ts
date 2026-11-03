/* @layer electron-main @kind logic */
import { join } from 'path';
import { serializeItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupRecord } from '@rotp/game-data';
import type { WriteItemGroupArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { replaceById } from '../source-writers';
import { ITEM_GROUPS_FILE } from './item-group-writer.constants';
import { symbolicNeedle } from './symbolic-needle';

const writeItemGroup = (root: string, args: WriteItemGroupArgs): Promise<WriteRecordResult> => {
  const record: ItemGroupRecord = { id: args.groupId, ...args.record };
  return editSourceFile(
    join(root, ...ITEM_GROUPS_FILE),
    (content) => replaceById(content, args.groupId, serializeItemGroupRecord(record), symbolicNeedle(args.groupId)),
    [args.groupId],
  );
};

export { writeItemGroup };
