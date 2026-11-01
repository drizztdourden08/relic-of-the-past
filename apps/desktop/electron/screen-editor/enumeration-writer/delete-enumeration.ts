/* @layer electron-main @kind logic */
import { join } from 'path';
import type { DeleteEnumerationArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { removeById } from '../source-writers';
import { ENUMERATION_FILE } from './enumeration-writer.constants';
import { regenerateTypes } from './regenerate-types';

const deleteEnumeration = async (root: string, args: DeleteEnumerationArgs): Promise<WriteRecordResult> => {
  const result = await editSourceFile(join(root, ...ENUMERATION_FILE), (content) => removeById(content, args.enumerationId), [args.enumerationId]);
  if (result.success) await regenerateTypes(root);
  return result;
};

export { deleteEnumeration };
