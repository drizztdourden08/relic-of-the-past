/* @layer site-kit @kind hook */
/** A site's upload queue as React sees it: the snapshot, redrawn on every change. */
import { useSyncExternalStore } from 'react';
import type { QueueSnapshot, UploadQueueControls } from './upload-queue.type';

const useUploadQueue = (queue: UploadQueueControls): QueueSnapshot =>
  useSyncExternalStore(queue.subscribe, queue.getSnapshot);

export { useUploadQueue };
