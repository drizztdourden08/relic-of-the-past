/* @layer test @kind logic */
/** In-memory FileStore for unit tests (binary + text + mtime). */
import type { FileStore } from '@shared/platform';

const enc = new TextEncoder();
const dec = new TextDecoder();

const createMemFileStore = (): FileStore => {
  const store = new Map<string, Uint8Array>();
  const mtimes = new Map<string, number>();
  let clock = 1;
  const put = (p: string, data: Uint8Array) => { store.set(p, data); mtimes.set(p, clock); clock += 1; };
  return {
    readBytes: async (p) => store.get(p) ?? null,
    readText: async (p) => { const b = store.get(p); return b ? dec.decode(b) : null; },
    writeBytes: async (p, d) => { put(p, d); },
    writeText: async (p, d) => { put(p, enc.encode(d)); },
    list: async (dir) => {
      const prefix = `${dir}/`;
      const names = new Set<string>();
      for (const k of store.keys()) if (k.startsWith(prefix)) names.add(k.slice(prefix.length).split('/')[0]);
      return [...names];
    },
    remove: async (p) => {
      for (const k of [...store.keys()]) if (k === p || k.startsWith(`${p}/`)) { store.delete(k); mtimes.delete(k); }
    },
    exists: async (p) => store.has(p) || [...store.keys()].some((k) => k.startsWith(`${p}/`)),
    mkdir: async () => {},
    stat: async (p) => (store.has(p) ? { bytes: store.get(p)!.length, isDirectory: false, mtimeMs: mtimes.get(p) ?? 0 } : null),
  };
};

export { createMemFileStore };
