/* @layer site-kit @kind hook */
import { useSyncExternalStore } from 'react';
import type { QueueSnapshot, UploadQueueControls } from '@rotp/hub-client';

const useUploadQueue = (queue: UploadQueueControls): QueueSnapshot =>
  useSyncExternalStore(queue.subscribe, queue.getSnapshot);

export { useUploadQueue };
