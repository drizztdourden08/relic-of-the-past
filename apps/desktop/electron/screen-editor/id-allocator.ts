/* @layer electron-main @kind logic */
/**
 * The single owner of record numbering.
 *
 * Ids are never supplied by a caller: this module reads every id already present
 * in a kind's source tree and hands out the next free `<kind>-NNN`. Every
 * allocation runs on one serialized queue, so two callers asking at the same time
 * get different numbers — an id cannot be minted twice, and it certainly cannot
 * be derived from a name, a hex index or a slug.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { ID_PAD_WIDTH } from '@shared/game/data/types/ids';

/** Where each kind's records live, relative to shared/game/data/. */
const KIND_ROOTS = {
  screen: 'screens',
  connection: 'connections',
  area: 'areas.ts',
  location: 'locations.ts',
} as const;

type AllocatableKind = keyof typeof KIND_ROOTS;

const DATA_SEGMENTS = ['shared', 'game', 'data'] as const;

// One queue for all allocations: each task only starts after the previous one has
// finished reading AND its caller has written, so a concurrent pair cannot both
// observe the same highest id.
let queue: Promise<unknown> = Promise.resolve();

const serialize = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.then(() => undefined, () => undefined);
  return run;
};

const collectFiles = async (path: string): Promise<string[]> => {
  if (path.endsWith('.ts')) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? collectFiles(child) : Promise.resolve(entry.name.endsWith('.ts') ? [child] : []);
  }));
  return nested.flat();
};

const highestUsed = async (root: string, kind: AllocatableKind): Promise<number> => {
  const base = join(root, ...DATA_SEGMENTS, KIND_ROOTS[kind]);
  const files = await collectFiles(base);
  const pattern = new RegExp(`id:\\s*'${kind}-(\\d+)'`, 'g');
  let highest = 0;
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    for (const match of content.matchAll(pattern)) {
      const n = Number(match[1]);
      if (n > highest) highest = n;
    }
  }
  return highest;
};

const format = (kind: AllocatableKind, n: number): string => `${kind}-${String(n).padStart(ID_PAD_WIDTH, '0')}`;

/**
 * The next `count` free ids for a kind. Runs the scan and the caller's write on
 * the same queue via `withAllocatedIds`, so nothing may allocate in between.
 */
const withAllocatedIds = <T>(
  root: string,
  kind: AllocatableKind,
  count: number,
  write: (ids: string[]) => Promise<T>,
): Promise<T> => serialize(async () => {
  const highest = await highestUsed(root, kind);
  const ids = Array.from({ length: count }, (_, i) => format(kind, highest + 1 + i));
  return write(ids);
});

export { withAllocatedIds };
export type { AllocatableKind };
