/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeItemGroupRecord } from '@shared/game/data/record-codegen';
import type { ItemGroupRecord } from '@shared/game/data/types';
import type { WriteItemGroupArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import { replaceById } from '../source-writers';
import { ITEM_GROUPS_FILE } from './item-group-writer.constants';
import { symbolicNeedle } from './symbolic-needle';

const writeItemGroup = async (root: string, args: WriteItemGroupArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ITEM_GROUPS_FILE);
  const record: ItemGroupRecord = { id: args.groupId, ...args.record };
  const content = await readFile(path, 'utf-8');
  const result = replaceById(content, args.groupId, serializeItemGroupRecord(record), symbolicNeedle(args.groupId));
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids: [args.groupId] };
};

export { writeItemGroup };
