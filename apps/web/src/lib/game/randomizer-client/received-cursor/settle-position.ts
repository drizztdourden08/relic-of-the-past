/* @layer bridge-wasm @kind logic */
import type { ReceivedCursor } from './received-cursor.type';

const settlePosition = (cursor: ReceivedCursor, index: number, saved: number): number => {
  if (index < saved) return saved;
  cursor.settled.add(index);
  let next = saved;
  while (cursor.settled.delete(next)) next += 1;
  return next;
};

export { settlePosition };
