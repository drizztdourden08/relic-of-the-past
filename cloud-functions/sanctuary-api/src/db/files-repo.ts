/* @layer root-config @kind logic */
/** Files. Every read goes through upgradeFile, so a record stored before
 *  versions existed comes back with its version 1. */
import { FieldValue } from '@google-cloud/firestore';
import type { FileType, SanctuaryFile } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { upgradeFile } from '../files/upgrade-file';
import type { StoredFile } from '../files/upgrade-file';
import { collection, db, decodeCursor, encodeCursor } from './firestore';

type FilePage = { items: SanctuaryFile[]; nextCursor: string | null };
type FilePatch = Partial<Omit<SanctuaryFile, 'id' | 'owner' | 'stats' | 'createdAt'>>;
/** Reads the latest record inside a transaction and answers the patch to write; throwing aborts. */
type FileChange = (file: SanctuaryFile) => FilePatch;

const files = () => collection('files');

const create = async (file: SanctuaryFile): Promise<void> => {
  await files().doc(file.id).set(file);
};

const get = async (id: string): Promise<SanctuaryFile | null> => {
  const snap = await files().doc(id).get();
  return snap.exists ? upgradeFile(snap.data() as StoredFile) : null;
};

const update = async (id: string, patch: FilePatch): Promise<void> => {
  await files().doc(id).update(patch);
};

/** Read, change and write one file atomically; used wherever the versions list moves. */
const mutate = (id: string, change: FileChange): Promise<SanctuaryFile> =>
  db().runTransaction(async (tx) => {
    const ref = files().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) throw notFound('No such file.');
    const file = upgradeFile(snap.data() as StoredFile);
    if (file.status === 'deleted') throw notFound('No such file.');
    const patch = change(file);
    tx.update(ref, patch);
    return { ...file, ...patch };
  });

/**
 * Ready files, newest first. `types` null means every type; one or more narrows the query
 * with the (status, type, createdAt) index. The cursor is the last row's createdAt.
 */
const listReady = async (types: FileType[] | null, cursor: string | undefined, pageSize: number): Promise<FilePage> => {
  let query = files().where('status', '==', 'ready');
  if (types?.length === 1) query = query.where('type', '==', types[0]);
  else if (types) query = query.where('type', 'in', types);
  query = query.orderBy('createdAt', 'desc').limit(pageSize);
  const after = decodeCursor(cursor);
  if (after !== null) query = query.startAfter(after);
  const snap = await query.get();
  const items = snap.docs.map((doc) => upgradeFile(doc.data() as StoredFile));
  const last = items[items.length - 1];
  return { items, nextCursor: items.length === pageSize && last ? encodeCursor(last.createdAt) : null };
};

const bumpDownloads = async (id: string): Promise<void> => {
  await files().doc(id).update({ 'stats.downloads': FieldValue.increment(1) });
};

const filesRepo = { create, get, update, mutate, listReady, bumpDownloads };

export { filesRepo };
export type { FilePage, FilePatch, FileChange };
