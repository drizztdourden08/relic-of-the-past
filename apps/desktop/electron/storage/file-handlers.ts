/* @layer electron-main @kind logic */
/**
 * Generic file-store IPC, rooted at the Data folder. Renderer-supplied paths are
 * POSIX and relative; resolution blocks traversal outside the root. Backs the
 * platform FileStore port on Electron.
 */
import { readFile, writeFile, readdir, rm, mkdir, stat } from 'fs/promises';
import { join, normalize, dirname, relative, isAbsolute } from 'path';
import type { FileStat } from '@shared/platform';
import { getUserDataPath } from '../lib/paths';
import { toArrayBufferOrNull } from '../lib/buffer';
import { handle } from '../lib/ipc/handle';

const resolveSafe = (rel: string): string => {
  const root = getUserDataPath();
  const full = join(root, normalize(rel));
  const back = relative(root, full);
  if (back.startsWith('..') || isAbsolute(back)) throw new Error(`path escapes data root: ${rel}`);
  return full;
};

const ensureParent = async (full: string): Promise<void> => {
  await mkdir(dirname(full), { recursive: true });
};

const registerFileHandlers = (): void => {
  handle('file:readBytes', async (_e, path) => {
    try { return toArrayBufferOrNull(await readFile(resolveSafe(path))); } catch { return null; }
  });
  handle('file:readText', async (_e, path) => {
    try { return await readFile(resolveSafe(path), 'utf8'); } catch { return null; }
  });
  handle('file:writeBytes', async (_e, path, data) => {
    const full = resolveSafe(path);
    await ensureParent(full);
    await writeFile(full, Buffer.from(data));
  });
  handle('file:writeText', async (_e, path, data) => {
    const full = resolveSafe(path);
    await ensureParent(full);
    await writeFile(full, data, 'utf8');
  });
  handle('file:list', async (_e, dir) => {
    try { return await readdir(resolveSafe(dir)); } catch { return []; }
  });
  handle('file:remove', async (_e, path) => {
    await rm(resolveSafe(path), { recursive: true, force: true });
  });
  handle('file:exists', async (_e, path) => {
    try { await stat(resolveSafe(path)); return true; } catch { return false; }
  });
  handle('file:mkdir', async (_e, dir) => {
    await mkdir(resolveSafe(dir), { recursive: true });
  });
  handle('file:stat', async (_e, path): Promise<FileStat | null> => {
    try {
      const s = await stat(resolveSafe(path));
      return { bytes: s.size, isDirectory: s.isDirectory(), mtimeMs: s.mtimeMs };
    } catch { return null; }
  });
};

export { registerFileHandlers };
