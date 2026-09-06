/* @layer electron-main @kind logic */
/**
 * Creating, relabelling, or removing a closed-set enumeration entry.
 *
 * No other collection references an entry's id (see reference-usage.ts), so
 * there is no delete-guard half. Every successful write also regenerates
 * `enumeration/generated-types.ts`, which the `World`/`ScreenKind`/... unions
 * come from.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { serializeEnumerationRecord } from '@shared/game/data/record-codegen';
import type { EnumerationEntry } from '@shared/game/data/types';
import type {
  Allocated, AllocateEnumerationArgs, AllocateEnumerationResult, DeleteEnumerationArgs, WriteEnumerationArgs,
  WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { withAllocatedIds } from './id-allocator';
import { escapeSingleQuote, insertBeforeArrayClose, removeById, replaceById } from './source-writers';
import { generateEnumTypes } from '../../../../scripts/generate-enum-types.mjs';

const ENUMERATION_FILE = ['shared', 'game', 'data', 'records', 'enumeration', 'enumeration.ts'] as const;

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keyed on the category/value pair: two categories may share a value
 * (`check-kind:npc` and `actor-kind:npc`). `category` always precedes `value`,
 * but hand-authored rows are one object per line while `literal()` emits one
 * field per line, so the gap is matched as whitespace of any width.
 */
const alreadyPresent = (content: string, category: string, value: string): boolean => {
  const cat = escapeRegExp(escapeSingleQuote(category));
  const val = escapeRegExp(escapeSingleQuote(value));
  return new RegExp(`category:\\s*'${cat}',\\s*value:\\s*'${val}',`).test(content);
};

/**
 * Best-effort: the entry write already landed, so a regen failure is logged, not
 * reported. The next edit or `npm run generate:enum-types` catches it up.
 *
 * `root` must be passed: `generateEnumTypes`'s default guess is relative to its
 * own file, which is wrong from `dist/electron/main.js` and crashed every
 * production launch on a nonexistent `dist/shared/...` path.
 */
const regenerateTypes = async (root: string): Promise<void> => {
  try {
    await generateEnumTypes(root);
  } catch (error) {
    console.error('enumeration-writer: failed to regenerate generated-types.ts', error);
  }
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

const deleteEnumeration = async (root: string, args: DeleteEnumerationArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ENUMERATION_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.enumerationId);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  await regenerateTypes(root);
  return { success: true, ids: [args.enumerationId] };
};

export { allocateEnumeration, deleteEnumeration, writeEnumeration };
