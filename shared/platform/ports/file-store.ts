/* @layer shared-platform @kind logic */
/**
 * The per-OS storage backend. Paths are POSIX, relative to the platform's Data root. Electron
 * backs this with Node fs under userData; Capacitor with the Filesystem plugin (app-private
 * Directory.Data). Domain logic (profiles, config, saves) sits on top so it runs everywhere.
 */

interface FileStat {
  bytes: number;
  isDirectory: boolean;
  mtimeMs: number; // last-modified epoch ms (0 if unavailable)
}

interface FileStore {
  readBytes: (path: string) => Promise<Uint8Array | null>;
  readText: (path: string) => Promise<string | null>;
  writeBytes: (path: string, data: Uint8Array) => Promise<void>;
  writeText: (path: string, data: string) => Promise<void>;
  list: (dir: string) => Promise<string[]>; // immediate child names, [] if missing
  remove: (path: string) => Promise<void>; // recursive; no-op if missing
  exists: (path: string) => Promise<boolean>;
  mkdir: (dir: string) => Promise<void>; // recursive
  stat: (path: string) => Promise<FileStat | null>;
}

export type { FileStat, FileStore };
