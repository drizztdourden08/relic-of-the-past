/* @layer bridge-wasm @kind logic */
import { nextToQueue } from './next-to-queue';
import type { ReceivedCursor } from './received-cursor.type';

const wasHanded = (cursor: ReceivedCursor, index: number, saved: number): boolean =>
  index < nextToQueue(cursor, saved) || cursor.handed.has(index);

export { wasHanded };
