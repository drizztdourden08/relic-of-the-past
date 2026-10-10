/* @layer shared-platform @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';

const enc = new TextEncoder();
const dec = new TextDecoder();

const childNames = (keys: Iterable<string>, dir: string): string[] => {
  const prefix = `${dir}/`;
  const names = new Set<string>();
  for (const k of keys) {
    const [name] = k.startsWith(prefix) ? k.slice(prefix.length).split('/') : [];
    if (name !== undefined) names.add(name);
  }
  return [...names];
};

const createMemFileStore = (): FileStore => {
  const store = new Map<string, Uint8Array>();
  const mtimes = new Map<string, number>();
  let clock = 1;
  const put = (p: string, data: Uint8Array): Promise<void> => {
    store.set(p, data);
    mtimes.set(p, clock);
    clock += 1;
    return Promise.resolve();
  };
  const remove = (p: string): Promise<void> => {
    for (const k of [...store.keys()]) if (k === p || k.startsWith(`${p}/`)) { store.delete(k); mtimes.delete(k); }
    return Promise.resolve();
  };
  const stat: FileStore['stat'] = (p) => {
    const data = store.get(p);
    return Promise.resolve(data === undefined ? null : { bytes: data.length, isDirectory: false, mtimeMs: mtimes.get(p) ?? 0 });
  };
  return {
    readBytes: (p) => Promise.resolve(store.get(p) ?? null),
    readText: (p) => { const b = store.get(p); return Promise.resolve(b ? dec.decode(b) : null); },
    writeBytes: (p, d) => put(p, d),
    writeText: (p, d) => put(p, enc.encode(d)),
    list: (dir) => Promise.resolve(childNames(store.keys(), dir)),
    remove,
    exists: (p) => Promise.resolve(store.has(p) || [...store.keys()].some((k) => k.startsWith(`${p}/`))),
    mkdir: () => Promise.resolve(),
    stat,
  };
};

export { createMemFileStore };
