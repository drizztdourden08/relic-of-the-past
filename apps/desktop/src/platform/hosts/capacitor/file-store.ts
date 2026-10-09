/* @layer renderer-other @kind logic */
import { Filesystem, Encoding } from '@capacitor/filesystem';
import type { FileStore, FileStat } from '@drizztdourden08/brock-core';
import { DIR } from './capacitor.constants';

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
};

const createCapacitorFileStore = (): FileStore => ({
  readBytes: async (path) => {
    try { const r = await Filesystem.readFile({ path, directory: DIR }); return base64ToBytes(r.data as string); }
    catch { return null; }
  },
  readText: async (path) => {
    try { const r = await Filesystem.readFile({ path, directory: DIR, encoding: Encoding.UTF8 }); return r.data as string; }
    catch { return null; }
  },
  writeBytes: async (path, data) => {
    await Filesystem.writeFile({ path, directory: DIR, data: bytesToBase64(data), recursive: true });
  },
  writeText: async (path, data) => {
    await Filesystem.writeFile({ path, directory: DIR, data, encoding: Encoding.UTF8, recursive: true });
  },
  list: async (dir) => {
    try { const r = await Filesystem.readdir({ path: dir, directory: DIR }); return r.files.map((f) => f.name); }
    catch { return []; }
  },
  remove: async (path) => {
    try {
      const s = await Filesystem.stat({ path, directory: DIR });
      if (s.type === 'directory') await Filesystem.rmdir({ path, directory: DIR, recursive: true });
      else await Filesystem.deleteFile({ path, directory: DIR });
    } catch { return; }
  },
  exists: async (path) => {
    try { await Filesystem.stat({ path, directory: DIR }); return true; } catch { return false; }
  },
  mkdir: async (dir) => {
    try { await Filesystem.mkdir({ path: dir, directory: DIR, recursive: true }); } catch { return; }
  },
  stat: async (path): Promise<FileStat | null> => {
    try {
      const s = await Filesystem.stat({ path, directory: DIR });
      return { bytes: s.size ?? 0, isDirectory: s.type === 'directory', mtimeMs: s.mtime ?? 0 };
    } catch { return null; }
  },
});

export { createCapacitorFileStore };
