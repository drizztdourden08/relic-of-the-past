/* @layer electron-main @kind logic */
/**
 * The single owner of record numbering. Ids are never supplied by a caller: this
 * reads every id in a kind's source tree and hands out the next free `<kind>-NNN`
 * on one serialized queue, so an id cannot be minted twice.
 */

import { readFile } from 'fs/promises';
import { KIND_ID_PREFIXES, makeId } from '@shared/game/data/types/ids';
import { collectKindFiles } from './data-files';

/**
 * Where each kind's records live, relative to shared/game/data/. A LIST because a
 * collection split by size (the two dungeon files) has no folder of its own to scan.
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
 * Matches the quoted id literal wherever it sits, not only after `id:`:
 * `item-groups.ts` also writes it as `Swords: 'ig-001'` in the `ITEM_GROUP_IDS`
 * map (see item-group-writer.ts), which an `id:`-anchored scan would miss. A
 * sibling reference (e.g. `toConnectionId`) also counts as used, which is the
 * safe direction.
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
