/* @layer site-kit @kind types */
import type { UploadJob } from './upload-job.type';

type QueueSnapshot = {
  jobs: readonly UploadJob[];
  openId: string | null;
};

type UploadQueueControls = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => QueueSnapshot;
  restore: () => Promise<void>;
  cancel: (id: string) => void;
  dismiss: (id: string) => void;
  clearFinished: () => void;
  pickFile: (id: string, file: File) => void;
  open: (id: string | null) => void;
  followUp: (id: string) => void;
  followUpLabel: string | null;
};

type UploadQueue<T, R> = UploadQueueControls & {
  add: (target: T, file: File | null) => string;
  start: (files: File[], target: T) => string[];
  onRecord: (listener: (record: R) => void) => () => void;
};

export type { QueueSnapshot, UploadQueueControls, UploadQueue };
