/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeTagRecord } from '@rotp/game-data';
import type { TagRecord } from '@rotp/game-data';
import type { WriteRecordResult, WriteTagArgs } from '@app/ipc/screen-editor-contract';
import { replaceById } from '../source-writers';
import { TAGS_FILE } from './tag-writer.constants';

const writeTag = async (root: string, args: WriteTagArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...TAGS_FILE);
  const record: TagRecord = { id: args.tagId, ...args.record };
  const content = await readFile(path, 'utf-8');
  const result = replaceById(content, args.tagId, serializeTagRecord(record));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.tagId] };
};

export { writeTag };
