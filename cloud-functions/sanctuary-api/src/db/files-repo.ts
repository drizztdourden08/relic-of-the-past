/* @layer root-config @kind logic */
import { FieldValue } from '@google-cloud/firestore';
import type { FileType, SanctuaryFile } from '@rotp/hub-contracts';
import { notFound } from '../../../hub-core/http/http-error';
import { upgradeFile } from '../files/upgrade-file';
import type { StoredFile } from '../files/upgrade-file.type';
import { db, decodeCursor, encodeCursor } from '../../../hub-core/db/firestore';
import { sanctuaryCollection } from './collections';
import type { FileChange, FilePage, FilePatch } from './files-repo.type';

const files = () => sanctuaryCollection('files');

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
