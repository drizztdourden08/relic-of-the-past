/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeTagRecord, splitTagKey } from '@rotp/game-data';
import type { TagRecord } from '@rotp/game-data';
import type { Allocated, AllocateTagArgs, AllocateTagResult } from '@app/ipc/screen-editor-contract';
import { withAllocatedIds } from '../id-allocator';
import { insertBeforeArrayClose } from '../source-writers';
import { CONVENTION, NO_SCOPE, TAGS_FILE } from './tag-writer.constants';

const alreadyPresent = (content: string, key: string): boolean =>
  content.includes(`name: '${key.replace(/'/g, "\\'")}',`);

const filledOr = (text: string | undefined, fallback: string): string =>
  (text === undefined || text === '' ? fallback : text);

const allocateTag = async (root: string, args: AllocateTagArgs): Promise<AllocateTagResult> => {
  const key = args.key.trim();
  const parts = splitTagKey(key);
  if (!parts) return { success: false, error: CONVENTION };
  if (args.appliesTo.length === 0) return { success: false, error: NO_SCOPE };

  const path = join(root, ...TAGS_FILE);
  const content = await readFile(path, 'utf-8');
  if (alreadyPresent(content, key)) return { success: false, error: `The tag ${key} already exists.` };

  return withAllocatedIds(root, 'tag', 1, async ([id]) => {
    const record: TagRecord = {
      id: id as TagRecord['id'],
      name: key,
      namespace: parts.namespace,
      value: parts.value,
      label: filledOr(args.label?.trim(), parts.value),
      namespaceLabel: filledOr(args.namespaceLabel?.trim(), parts.namespace),
      appliesTo: [...args.appliesTo],
    };
    const fresh = await readFile(path, 'utf-8');
    const result = insertBeforeArrayClose(fresh, serializeTagRecord(record));
    if (result.error) return { success: false, error: result.error };
    await writeFile(path, result.content, 'utf-8');
    return { success: true, record: record as Allocated<TagRecord> };
  });
};

export { allocateTag };
