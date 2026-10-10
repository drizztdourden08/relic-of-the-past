/* @layer sanctuary-site @kind logic */
import type { DropQueue } from './drop-queue.type';

const uploadDone = (state: DropQueue): DropQueue => ({ ...state, upload: [] });

export { uploadDone };
