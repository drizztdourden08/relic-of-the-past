/* @layer electron-main @kind logic */
import { join } from 'path';
import type { DeleteTagArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { removeById } from '../source-writers';
import { TAGS_FILE } from './tag-writer.constants';

const deleteTag = (root: string, args: DeleteTagArgs): Promise<WriteRecordResult> =>
  editSourceFile(join(root, ...TAGS_FILE), (content) => removeById(content, args.tagId), [args.tagId]);

export { deleteTag };
