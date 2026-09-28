/* @layer site-kit @kind types */
import type { UploadRecord } from './upload-record.type';

/** What the queue holds for a job beside its snapshot row: the record, the bytes and the run. */
type LiveJob<T> = {
  record: UploadRecord<T>;
  /** The picked file or its kept copy; null until a restored job gets it back. */
  file: Blob | null;
  /** Set while the job runs; aborting it stops the run. */
  controller: AbortController | null;
  cancelled: boolean;
  /** The record and copy writes still under way; the record is dropped only after them. */
  stored: Promise<unknown>;
};

export type { LiveJob };
