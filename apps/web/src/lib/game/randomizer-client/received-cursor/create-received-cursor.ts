/* @layer bridge-wasm @kind logic */
import type { ReceivedCursor } from './received-cursor.type';

const createReceivedCursor = (): ReceivedCursor => ({ queued: 0, handed: new Set(), settled: new Set(), epoch: 0 });

export { createReceivedCursor };
