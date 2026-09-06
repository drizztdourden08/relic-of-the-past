/* @layer electron-main @kind logic */
/**
 * Node-fs FileStore for the main process itself, rooted at the same Data
 * directory `file-handlers.ts` exposes to the renderer over IPC. This one is
 * called in-process, so a shared/storage domain module can run directly inside
 * a handler without a renderer round trip.
 */
import { readFile, writeFile, readdir, rm, mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import type { FileStore } from '@shared/platform';
import { getUserDataPath } from './paths';

const resolve = (rel: string): string => join(getUserDataPath(), rel);

const ensureParent = (full: string): Promise<void> => mkdir(dirname(full), { recursive: true }).then(() => {});

const createNodeFileStore = (): FileStore => ({
  readBytes: async (path) => {
    try { return await readFile(resolve(path)); } catch { return null; }
  },
  readText: async (path) => {
    try { return await readFile(resolve(path), 'utf8'); } catch { return null; }
  },
  writeBytes: async (path, data) => {
    const full = resolve(path);
    await ensureParent(full);
    await writeFile(full, data);
  },
  writeText: async (path, data) => {
    const full = resolve(path);
    await ensureParent(full);
    await writeFile(full, data, 'utf8');
  },
  list: async (dir) => {
    try { return await readdir(resolve(dir)); } catch { return []; }
  },
  remove: async (path) => {
    await rm(resolve(path), { recursive: true, force: true });
  },
  exists: async (path) => {
    try { await stat(resolve(path)); return true; } catch { return false; }
  },
  mkdir: async (dir) => {
    await mkdir(resolve(dir), { recursive: true });
  },
  stat: async (path) => {
    try {
      const s = await stat(resolve(path));
      return { bytes: s.size, isDirectory: s.isDirectory(), mtimeMs: s.mtimeMs };
    } catch { return null; }
  },
});

export { createNodeFileStore };
