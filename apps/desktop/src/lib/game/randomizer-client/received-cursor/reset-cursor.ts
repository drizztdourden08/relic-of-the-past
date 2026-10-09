/* @layer bridge-wasm @kind logic */
import type { ReceivedCursor } from './received-cursor.type';

const resetCursor = (cursor: ReceivedCursor): void => {
  cursor.queued = 0;
  cursor.handed.clear();
  cursor.settled.clear();
  cursor.epoch += 1;
};

export { resetCursor };
