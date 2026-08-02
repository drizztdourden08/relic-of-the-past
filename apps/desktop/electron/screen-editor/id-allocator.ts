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

import { readFile } from 'fs/promises';
import { KIND_ID_PREFIXES, makeId } from '@shared/game/data/types/ids';
import { collectKindFiles } from './data-files';

/**
 * Where each kind's records live, relative to shared/game/data/.
 *
 * A LIST rather than one path, because a collection split by size alone spreads
 * its records over sibling files with no folder of their own to scan — the two
 * dungeon files being the case that forced it. Every entry is read, so a number
 * already in use anywhere in the kind is seen.
 */
const KIND_ROOTS = {
  screen: ['screens'],
  connection: ['connections'],
  check: ['checks'],
  item: ['items'],
  dungeon: ['dungeons-1.ts', 'dungeons-2.ts'],
  area: ['areas.ts'],
  location: ['locations.ts'],
  actor: ['actors'],
  tag: ['tags'],
  'item-group': ['item-groups/item-groups.ts'],
  enumeration: ['enumeration/enumeration.ts'],
} as const satisfies Record<string, readonly string[]>;

type AllocatableKind = keyof typeof KIND_ROOTS;

// One queue for all allocations: each task only starts after the previous one has
// finished reading AND its caller has written, so a concurrent pair cannot both
// observe the same highest id.
let queue: Promise<unknown> = Promise.resolve();

const serialize = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.then(() => undefined, () => undefined);
  return run;
};

/**
 * Matches the quoted id literal itself, wherever it sits — not only right
 * after `id:`. Every other kind's records only ever carry the pattern as an
 * `id:` value, but `item-groups.ts` also writes it as `Swords: 'ig-001'` in
 * the symbolic `ITEM_GROUP_IDS` map a pristine row's `id` still points at
 * (see item-group-writer.ts) — a scan anchored on `id:` would never see
 * those and would keep minting the already-used `ig-001`. Any other kind
 * referencing a sibling's id (e.g. a connection's `counterpartId`) is still
 * counted as "used" either way, which is the safe direction: it can only
 * make the scan skip a taken number, never hand one out twice.
 */
const highestUsed = async (root: string, kind: AllocatableKind): Promise<number> => {
  const files = await collectKindFiles(root, KIND_ROOTS[kind]);
  const prefix = KIND_ID_PREFIXES[kind];
  const pattern = new RegExp(`'${prefix}-(\\d+)'`, 'g');
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

const format = (kind: AllocatableKind, n: number): string => makeId(kind, n);

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

export { KIND_ROOTS, withAllocatedIds };
export type { AllocatableKind };
