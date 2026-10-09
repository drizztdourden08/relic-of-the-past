/* @layer shared-platform @kind types */
interface FileStat {
  bytes: number;
  isDirectory: boolean;
  mtimeMs: number;
}

interface FileStore {
  readBytes: (path: string) => Promise<Uint8Array | null>;
  readText: (path: string) => Promise<string | null>;
  writeBytes: (path: string, data: Uint8Array) => Promise<void>;
  writeText: (path: string, data: string) => Promise<void>;
  list: (dir: string) => Promise<string[]>;
  remove: (path: string) => Promise<void>;
  trash?: (path: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  mkdir: (dir: string) => Promise<void>;
  stat: (path: string) => Promise<FileStat | null>;
}

export type { FileStat, FileStore };
