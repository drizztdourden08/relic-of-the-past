/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeEnumerationRecord } from '@rotp/game-data';
import type { EnumerationEntry } from '@rotp/game-data';
import type { WriteEnumerationArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { replaceById } from '../source-writers';
import { ENUMERATION_FILE } from './enumeration-writer.constants';
import { regenerateTypes } from './regenerate-types';

const writeEnumeration = async (root: string, args: WriteEnumerationArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ENUMERATION_FILE);
  const record: EnumerationEntry = { id: args.enumerationId, ...args.record };
  const content = await readFile(path, 'utf-8');
  const result = replaceById(content, args.enumerationId, serializeEnumerationRecord(record));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  await regenerateTypes(root);
  return { success: true, ids: [args.enumerationId] };
};

export { writeEnumeration };
