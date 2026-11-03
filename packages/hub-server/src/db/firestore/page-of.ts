/* @layer hub-core @kind logic */
import { encodeCursor } from './encode-cursor';

const pageOf = <T extends { createdAt: number }>(items: T[], pageSize: number): { items: T[]; nextCursor: string | null } => {
  const last = items.at(-1);
  return { items, nextCursor: items.length === pageSize && last ? encodeCursor(last.createdAt) : null };
};

export { pageOf };
