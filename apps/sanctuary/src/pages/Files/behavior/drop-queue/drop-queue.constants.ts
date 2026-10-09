/* @layer sanctuary-site @kind constants */
import type { DropQueue } from './drop-queue.type';

const EMPTY_QUEUE: DropQueue = { queue: [], batch: [], asking: null, version: null, upload: [] };

export { EMPTY_QUEUE };
