/* @layer electron-main @kind logic */
/** Read/write JSON files with a fallback on read and dir-creation on write. */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

/** Editors, shells (Windows PowerShell's Set-Content/Out-File) and other tools
 *  routinely write a leading UTF-8 byte-order mark; JSON.parse rejects it outright. */
const stripBom = (text: string): string => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

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

const writeJson = async (file: string, data: unknown): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

export { readJson, writeJson, stripBom };
