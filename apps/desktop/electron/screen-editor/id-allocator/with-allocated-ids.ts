/* @layer electron-main @kind logic */
import { makeId } from '@rotp/game-data';
import { highestUsed } from './highest-used';
import type { AllocatableKind } from './id-allocator.type';
import { serializeAllocation } from './serialize-allocation';

const format = (kind: AllocatableKind, n: number): string => makeId(kind, n);

const withAllocatedIds = <T>(
  root: string,
  kind: AllocatableKind,
  count: number,
  write: (ids: string[]) => Promise<T>,
): Promise<T> => serializeAllocation(async () => {
  const highest = await highestUsed(root, kind);
  const ids = Array.from({ length: count }, (_, i) => format(kind, highest + 1 + i));
  return write(ids);
});

export { withAllocatedIds };
