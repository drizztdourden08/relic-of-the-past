/* @layer electron-main @kind logic */
import { join } from 'path';
import type { DeleteItemGroupArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { removeById } from '../source-writers';
import { ITEM_GROUPS_FILE } from './item-group-writer.constants';
import { symbolicNeedle } from './symbolic-needle';

const deleteItemGroup = (root: string, args: DeleteItemGroupArgs): Promise<WriteRecordResult> =>
  editSourceFile(
    join(root, ...ITEM_GROUPS_FILE),
    (content) => removeById(content, args.groupId, symbolicNeedle(args.groupId)),
    [args.groupId],
  );

export { deleteItemGroup };
