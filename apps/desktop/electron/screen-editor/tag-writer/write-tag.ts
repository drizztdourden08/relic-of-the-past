/* @layer electron-main @kind logic */
import { join } from 'path';
import { serializeTagRecord } from '@rotp/game-data';
import type { TagRecord } from '@rotp/game-data';
import type { WriteRecordResult, WriteTagArgs } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from '../edit-source-file';
import { replaceById } from '../source-writers';
import { TAGS_FILE } from './tag-writer.constants';

const writeTag = (root: string, args: WriteTagArgs): Promise<WriteRecordResult> => {
  const record: TagRecord = { id: args.tagId, ...args.record };
  return editSourceFile(join(root, ...TAGS_FILE), (content) => replaceById(content, args.tagId, serializeTagRecord(record)), [args.tagId]);
};

export { writeTag };
