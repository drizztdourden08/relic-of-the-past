/* @layer bridge-wasm @kind logic */
import { nextToQueue } from './next-to-queue';
import type { ReceivedCursor } from './received-cursor.type';

const markHanded = (cursor: ReceivedCursor, index: number, saved: number): void => {
  cursor.queued = nextToQueue(cursor, saved);
  cursor.handed.add(index);
  while (cursor.handed.delete(cursor.queued)) cursor.queued += 1;
};

export { markHanded };
