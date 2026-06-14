/* @layer shared-storage @kind logic */
/** JSON read/write over a FileStore, with a fallback on read (2-space format). */
import type { FileStore } from '@shared/platform';

const readJson = async <T>(files: FileStore, path: string, fallback: T): Promise<T> => {
  const text = await files.readText(path);
  if (text == null) return fallback;
  try { return JSON.parse(text) as T; } catch { return fallback; }
};

const writeJson = (files: FileStore, path: string, data: unknown): Promise<void> =>
  files.writeText(path, JSON.stringify(data, null, 2));

export { readJson, writeJson };
