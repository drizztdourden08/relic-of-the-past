/* @layer electron-main @kind logic */
/**
 * Generic file-store IPC, rooted at the Data folder. Renderer-supplied paths are
 * POSIX and relative; resolution blocks traversal outside the root. Backs the
 * platform FileStore port on Electron. Every write, removal and new folder inside an item the
 * Hookshop installed is refused (./installed-guard).
 */
import { readFile, writeFile, readdir, rm, mkdir, stat } from 'fs/promises';
import { join, normalize, dirname, relative, isAbsolute } from 'path';
import { shell } from 'electron';
import type { FileStat } from '@shared/platform';
import { getUserDataPath } from '../lib/paths';
import { toArrayBufferOrNull } from '../lib/buffer';
import { handle } from '../lib/ipc/handle';
import { refuseInstalled, refuseInstalledRemoval } from './installed-guard';

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
    await refuseInstalled(path);
    await ensureParent(full);
    await writeFile(full, Buffer.from(data));
  });
  handle('file:writeText', async (_e, path, data) => {
    const full = resolveSafe(path);
    await refuseInstalled(path);
    await ensureParent(full);
    await writeFile(full, data, 'utf8');
  });
  handle('file:list', async (_e, dir) => {
    try { return await readdir(resolveSafe(dir)); } catch { return []; }
  });
  handle('file:remove', async (_e, path) => {
    const full = resolveSafe(path);
    await refuseInstalledRemoval(path);
    await rm(full, { recursive: true, force: true });
  });
  // To the Recycle Bin (the Trash on macOS), so a delete can be undone there; no-op if missing.
  handle('file:trash', async (_e, path) => {
    const full = resolveSafe(path);
    await refuseInstalledRemoval(path);
    try { await stat(full); } catch { return; }
    await shell.trashItem(full);
  });
  handle('file:exists', async (_e, path) => {
    try { await stat(resolveSafe(path)); return true; } catch { return false; }
  });
  handle('file:mkdir', async (_e, dir) => {
    const full = resolveSafe(dir);
    await refuseInstalled(dir);
    await mkdir(full, { recursive: true });
  });
  handle('file:stat', async (_e, path): Promise<FileStat | null> => {
    try {
      const s = await stat(resolveSafe(path));
      return { bytes: s.size, isDirectory: s.isDirectory(), mtimeMs: s.mtimeMs };
    } catch { return null; }
  });
};

export { registerFileHandlers };
