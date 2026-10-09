/* @layer electron-main @kind logic */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeEnumerationRecord } from '@shared/game/data/record-codegen';
import type { EnumerationEntry } from '@shared/game/data/types';
import type {
  Allocated, AllocateEnumerationArgs, AllocateEnumerationResult,
} from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from '../id-allocator';
import { escapeSingleQuote, insertBeforeArrayClose } from '../source-writers';
import { ENUMERATION_FILE } from './enumeration-writer.constants';
import { regenerateTypes } from './regenerate-types';

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const alreadyPresent = (content: string, category: string, value: string): boolean => {
  const cat = escapeRegExp(escapeSingleQuote(category));
  const val = escapeRegExp(escapeSingleQuote(value));
  return new RegExp(`category:\\s*'${cat}',\\s*value:\\s*'${val}',`).test(content);
};

const allocateEnumeration = async (root: string, args: AllocateEnumerationArgs): Promise<AllocateEnumerationResult> => {
  const value = args.value.trim();
  const label = args.label.trim();
  if (!value) return { success: false, error: 'An enumeration entry needs a value.' };
  if (!label) return { success: false, error: 'An enumeration entry needs a label.' };
  if (args.appliesTo.length === 0) {
    return { success: false, error: 'An enumeration entry has to apply to at least one collection.' };
  }

  const path = join(root, ...ENUMERATION_FILE);
  const content = await readFile(path, 'utf-8');
  if (alreadyPresent(content, args.category, value)) {
    return { success: false, error: `An entry for ${args.category}:${value} already exists.` };
  }

  return withAllocatedIds(root, 'enumeration', 1, async ([id]) => {
    const record: EnumerationEntry = {
      id: id as EnumerationEntry['id'],
      category: args.category,
      value,
      label,
      appliesTo: [...args.appliesTo],
    };
    const fresh = await readFile(path, 'utf-8');
    const result = insertBeforeArrayClose(fresh, serializeEnumerationRecord(record));
    if (result.error) return { success: false, error: result.error };
    await writeFile(path, result.content, 'utf-8');
    await regenerateTypes(root);
    return { success: true, record: record as Allocated<EnumerationEntry> };
  });
};

export { allocateEnumeration };
