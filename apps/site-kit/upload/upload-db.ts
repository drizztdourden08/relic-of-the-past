/* @layer site-kit @kind logic */
/**
 * The browser database the upload queue keeps its jobs in: one store of job records and
 * one of kept files, both keyed by job id. Opened once per page, lazily. A browser without
 * IndexedDB (or one that refuses it) answers null, and the queue runs without resume.
 */
const DB_NAME = 'site-uploads';
const DB_VERSION = 1;
const RECORDS = 'records';
const FILES = 'files';

type StoreName = typeof RECORDS | typeof FILES;

let opening: Promise<IDBDatabase | null> | null = null;

const openDb = (): Promise<IDBDatabase | null> => {
  opening ??= new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDS)) db.createObjectStore(RECORDS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return opening;
};

const settle = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('The browser storage refused the request.'));
});

/** Runs one request against one store; null when there is no database. */
const withStore = async <T>(
  name: StoreName,
  mode: IDBTransactionMode,
  act: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> => {
  const db = await openDb();
  if (!db) return null;
  return settle(act(db.transaction(name, mode).objectStore(name)));
};

export { withStore, RECORDS, FILES };
export type { StoreName };
