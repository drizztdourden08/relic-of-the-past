/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { stripBom } from './strip-bom';

const readJson = async <T>(file: string, fallback: T): Promise<T> => {
  try {
    const data = await readFile(file, 'utf-8');
    return JSON.parse(stripBom(data)) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[json-store] Failed to read ${file}, using fallback:`, err);
    }
    return fallback;
  }
};

export { readJson };
