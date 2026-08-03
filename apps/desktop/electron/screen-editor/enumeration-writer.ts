/* @layer electron-main @kind logic */
/**
 * Creating, relabelling, or removing a closed-set enumeration entry.
 *
 * Every row here is plain data — the ten label categories these entries fill
 * in for (world, screen-status, ...) have no writer of their own beyond this
 * one, and no other collection stores a foreign-key reference to an entry's
 * id (see reference-usage.ts), so this is a plain three-op writer with no
 * delete-guard half. New rows mint a real `enum-NNN` id through the
 * allocator, the same bargain `allocateTag`/`allocateItemGroup` make for a
 * brand-new row in their own collections.
 *
 * Every successful write also regenerates `enumeration/generated-types.ts` —
 * the 10 hand-written `World`/`ScreenKind`/... unions are generated from this
 * same file, so an edit made here must not go stale the moment it lands.
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

const ENUMERATION_FILE = ['shared', 'game', 'data', 'enumeration', 'enumeration.ts'] as const;

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * An entry already on file for this category/value pair — the pair that
 * actually keys the vocabulary (two different categories may share a value,
 * e.g. `check-kind:npc` and `actor-kind:npc`, so the value alone cannot be
 * the check). `category` is always emitted immediately before `value`, but
 * NOT always on the same wrap: the committed file's hand-authored rows are one
 * object per line, while `literal()` (this writer's own emitter) puts one
 * field per line — so the gap between them is matched as whitespace of any
 * width rather than a fixed literal string.
 */
const alreadyPresent = (content: string, category: string, value: string): boolean => {
  const cat = escapeRegExp(escapeSingleQuote(category));
  const val = escapeRegExp(escapeSingleQuote(value));
  return new RegExp(`category:\\s*'${cat}',\\s*value:\\s*'${val}',`).test(content);
};

/**
 * Best-effort — the entry write already succeeded and landed on disk; a
 * regen failure (a locked file, a bad edit shape) is worth logging but must
 * not turn a successful write into a reported failure. The next edit, or a
 * manual `npm run generate:enum-types`, catches it back up.
 */
const regenerateTypes = async (): Promise<void> => {
  try {
    await generateEnumTypes();
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
    await regenerateTypes();
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
  await regenerateTypes();
  return { success: true, ids: [args.enumerationId] };
};

const deleteEnumeration = async (root: string, args: DeleteEnumerationArgs): Promise<WriteRecordResult> => {
  const path = join(root, ...ENUMERATION_FILE);
  const content = await readFile(path, 'utf-8');
  const result = removeById(content, args.enumerationId);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  await regenerateTypes();
  return { success: true, ids: [args.enumerationId] };
};

export { allocateEnumeration, deleteEnumeration, writeEnumeration };
