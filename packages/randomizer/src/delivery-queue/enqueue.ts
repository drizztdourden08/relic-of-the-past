/* @layer bridge-wasm @kind logic */
import type { EnqueueParams } from './delivery-queue.type';
import { sharedEngine } from './shared-engine';
import { track } from './track';

const enqueue = (params: EnqueueParams): string => {
  const { id, request } = track(params);
  sharedEngine.enqueue(request);
  return id;
};

export { enqueue };
