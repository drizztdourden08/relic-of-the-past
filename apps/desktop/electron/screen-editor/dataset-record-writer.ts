/* @layer electron-main @kind logic */
/**
 * The create/update/delete engine the record-facade collections share. Everything
 * kind-specific is a `RecordWriterSpec` (kind to allocate under, where a new
 * record is filed, which emitter serializes it), so the three operations are
 * written once.
 *
 * A CREATE uses the spec's canonical destination; an UPDATE or DELETE locates the
 * record by id (data-files.ts), because several collections were split by size
 * and a record's real home is not always the one the resolver would pick today.
 */

import { readFile, writeFile } from 'fs/promises';
import type { FileTarget } from '@shared/game/data/record-file-targets';
import type { Unnumbered } from '@shared/game/data/record-codegen';
import type {
  Allocated, AllocateRecordResult, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { locateRecordFile } from './data-files';
import { KIND_ROOTS, withAllocatedIds } from './id-allocator';
import type { AllocatableKind } from './id-allocator';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, removeById, replaceById } from './source-writers';
import type { WriteResult } from './source-writers';

interface RecordWriterSpec<T extends { id: string }> {
  /** The kind to allocate an id under, and whose subtree an existing record is found in. */
  kind: AllocatableKind;
  /** Where a BRAND-NEW record is filed. */
  target: (record: Unnumbered<T>) => FileTarget;
  serialize: (record: T) => string;
}

const NO_TARGET = 'No source file could be derived for this record.';

const edit = async (path: string, apply: (content: string) => WriteResult): Promise<string | null> => {
  const content = await readFile(path, 'utf-8');
  const result = apply(content);
  if (result.error) return result.error;
  await writeFile(path, result.content, 'utf-8');
  return null;
};

/** The file an existing record sits in, or the error naming why it was not found. */
const homeOf = async (
  root: string,
  kind: AllocatableKind,
  id: string,
): Promise<{ path: string } | { error: string }> => {
  const path = await locateRecordFile(root, KIND_ROOTS[kind], id);
  if (!path) return { error: `Could not find ${id} in any ${kind} source file` };
  return { path };
};

const createRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  record: Unnumbered<T>,
): Promise<AllocateRecordResult<T>> => {
  const target = spec.target(record);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_TARGET };
  const path = resolveSourceFile(root, target.relativePath, 'data');

  return withAllocatedIds(root, spec.kind, 1, async ([id]) => {
    const full = { id, ...record } as unknown as T;
    const error = await edit(path, content => insertBeforeArrayClose(content, spec.serialize(full)));
    if (error) return { success: false, error };
    return { success: true, record: full as Allocated<T> };
  });
};

const updateRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  id: string,
  record: Unnumbered<T>,
): Promise<WriteRecordResult> => {
  const home = await homeOf(root, spec.kind, id);
  if ('error' in home) return { success: false, error: home.error };
  const full = { id, ...record } as unknown as T;
  const error = await edit(home.path, content => replaceById(content, id, spec.serialize(full)));
  return error ? { success: false, error } : { success: true, ids: [id] };
};

const deleteRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  id: string,
): Promise<WriteRecordResult> => {
  const home = await homeOf(root, spec.kind, id);
  if ('error' in home) return { success: false, error: home.error };
  const error = await edit(home.path, content => removeById(content, id));
  return error ? { success: false, error } : { success: true, ids: [id] };
};

export { createRecord, deleteRecord, updateRecord };
export type { RecordWriterSpec };
