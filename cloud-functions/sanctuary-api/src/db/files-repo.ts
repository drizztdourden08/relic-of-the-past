/* @layer root-config @kind logic */
import { FieldValue } from '@google-cloud/firestore';
import type { FileType, SanctuaryFile } from '../../../../shared/sanctuary';
import { collection, decodeCursor, encodeCursor } from './firestore';

type FilePage = { items: SanctuaryFile[]; nextCursor: string | null };
type FilePatch = Partial<Pick<SanctuaryFile, 'type' | 'tags' | 'version' | 'note' | 'status' | 'upload' | 'bytes'>>;

const files = () => collection('files');

const create = async (file: SanctuaryFile): Promise<void> => {
  await files().doc(file.id).set(file);
};

const get = async (id: string): Promise<SanctuaryFile | null> => {
  const snap = await files().doc(id).get();
  return snap.exists ? (snap.data() as SanctuaryFile) : null;
};

const update = async (id: string, patch: FilePatch): Promise<void> => {
  await files().doc(id).update(patch);
};

/** Ready files, newest first, of one type or of every type. The cursor is the last row's createdAt. */
const listReady = async (type: FileType | null, cursor: string | undefined, pageSize: number): Promise<FilePage> => {
  let query = files().where('status', '==', 'ready');
  if (type) query = query.where('type', '==', type);
  query = query.orderBy('createdAt', 'desc').limit(pageSize);
  const after = decodeCursor(cursor);
  if (after !== null) query = query.startAfter(after);
  const snap = await query.get();
  const items = snap.docs.map((doc) => doc.data() as SanctuaryFile);
  const last = items[items.length - 1];
  return { items, nextCursor: items.length === pageSize && last ? encodeCursor(last.createdAt) : null };
};

const bumpDownloads = async (id: string): Promise<void> => {
  await files().doc(id).update({ 'stats.downloads': FieldValue.increment(1) });
};

const filesRepo = { create, get, update, listReady, bumpDownloads };

export { filesRepo };
export type { FilePage, FilePatch };
