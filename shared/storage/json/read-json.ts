/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';

const readJson = async <T>(files: FileStore, path: string, fallback: T): Promise<T> => {
  const text = await files.readText(path);
  if (text == null) return fallback;
  try { return JSON.parse(text) as T; } catch { return fallback; }
};

export { readJson };
