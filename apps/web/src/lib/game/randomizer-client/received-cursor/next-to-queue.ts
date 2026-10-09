/* @layer bridge-wasm @kind logic */
import type { ReceivedCursor } from './received-cursor.type';

const nextToQueue = (cursor: ReceivedCursor, saved: number): number => Math.max(cursor.queued, saved);

export { nextToQueue };
