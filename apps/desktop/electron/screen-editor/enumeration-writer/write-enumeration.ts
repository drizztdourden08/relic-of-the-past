/* @layer electron-main @kind logic */
import { join } from 'path';
import { serializeEnumerationRecord } from '@rotp/game-data';
import type { EnumerationEntry } from '@rotp/game-data';
import type { WriteEnumerationArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { replaceById } from '../source-writers';
import { ENUMERATION_FILE } from './enumeration-writer.constants';
import { regenerateTypes } from './regenerate-types';

const writeEnumeration = async (root: string, args: WriteEnumerationArgs): Promise<WriteRecordResult> => {
  const record: EnumerationEntry = { id: args.enumerationId, ...args.record };
  const result = await editSourceFile(
    join(root, ...ENUMERATION_FILE),
    (content) => replaceById(content, args.enumerationId, serializeEnumerationRecord(record)),
    [args.enumerationId],
  );
  if (result.success) await regenerateTypes(root);
  return result;
};

export { writeEnumeration };
