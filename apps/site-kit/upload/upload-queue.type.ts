/* @layer site-kit @kind types */
import type { UploadJob } from './upload-job.type';

/** What the tray and the dialog read: every job, newest first, and the one the dialog shows. */
type QueueSnapshot = {
  jobs: readonly UploadJob[];
  openId: string | null;
};

/** The queue as the tray, the dialog and the leave guard use it, whatever the site. */
type UploadQueueControls = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => QueueSnapshot;
  /** Brings back the jobs a reload cut off; runs once per page. */
  restore: () => Promise<void>;
  cancel: (id: string) => void;
  dismiss: (id: string) => void;
  clearFinished: () => void;
  /** The file for a job restored without its copy; refused unless it is the same file. */
  pickFile: (id: string, file: File) => void;
  /** Opens the dialog on a job; null closes it. */
  open: (id: string | null) => void;
  followUp: (id: string) => void;
  /** The follow-up button's words; null when the site has no follow-up. */
  followUpLabel: string | null;
};

/** A site's queue: the controls plus starting jobs and hearing about the records they make. */
type UploadQueue<T, R> = UploadQueueControls & {
  /** One job; `file` null for a job made of the site's own steps only. Answers its id. */
  add: (target: T, file: File | null) => string;
  /** One job per dropped file the target takes. */
  start: (files: File[], target: T) => string[];
  /** Hears every record a job's steps answer with; answers the unsubscribe. */
  onRecord: (listener: (record: R) => void) => () => void;
};

export type { QueueSnapshot, UploadQueueControls, UploadQueue };
