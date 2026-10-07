/* @layer site-kit @kind logic */
/**
 * Each job's resumable state in IndexedDB, so a reload restores it (a memento of the job),
 * and the browser's own copy of the file when there is room for it. A copy is kept only
 * while the origin's free quota exceeds the file by KEEP_MARGIN; the record and the copy
 * are dropped together once the job ends. Every call swallows storage errors: a browser
 * that cannot keep them loses the resume and nothing else.
 */
import { FILES, RECORDS, withStore } from './upload-db';
import type { UploadRecord } from './upload-record.type';

/** Free space the copy needs, as a multiple of the file's size. */
const KEEP_MARGIN = 1.2;

const saveRecord = async <T>(record: UploadRecord<T>): Promise<void> => {
  await withStore(RECORDS, 'readwrite', (store) => store.put(record)).catch(() => null);
};

const readRecords = async <T>(site: string): Promise<UploadRecord<T>[]> => {
  const all = await withStore(RECORDS, 'readonly', (store) => store.getAll()).catch(() => null);
  return ((all ?? []) as UploadRecord<T>[]).filter((record) => record.site === site);
};

const hasRoomFor = async (bytes: number): Promise<boolean> => {
  if (!navigator.storage?.estimate) return false;
  const { quota = 0, usage = 0 } = await navigator.storage.estimate();
  return quota - usage > bytes * KEEP_MARGIN;
};

/** Keeps the browser's own copy of the file; answers whether it did. */
const keepFile = async (id: string, file: Blob): Promise<boolean> => {
  try {
    if (!(await hasRoomFor(file.size))) return false;
    const saved = await withStore(FILES, 'readwrite', (store) => store.put(file, id));
    return saved !== null;
  } catch {
    return false;
  }
};

const readKeptFile = async (id: string): Promise<Blob | null> => {
  const file = await withStore<unknown>(FILES, 'readonly', (store) => store.get(id)).catch(() => null);
  return file instanceof Blob ? file : null;
};

/** The job is over: its record and its copy go. */
const dropRecord = async (id: string): Promise<void> => {
  await Promise.all([
    withStore(RECORDS, 'readwrite', (store) => store.delete(id)).catch(() => null),
    withStore(FILES, 'readwrite', (store) => store.delete(id)).catch(() => null),
  ]);
};

export { saveRecord, readRecords, keepFile, readKeptFile, dropRecord };
