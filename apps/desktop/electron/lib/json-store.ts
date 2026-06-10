/* @layer electron-main @kind logic */
/** Read/write JSON files with a fallback on read and dir-creation on write. */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const readJson = async <T>(file: string, fallback: T): Promise<T> => {
  try {
    const data = await readFile(file, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async (file: string, data: unknown): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

export { readJson, writeJson };
