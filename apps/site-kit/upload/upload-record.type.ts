/* @layer site-kit @kind types */
import type { UploadResume, UploadStep } from './upload-job.type';

/** What identifies a picked file again after a reload: the same name, size and date. */
type FileFacts = {
  name: string;
  size: number;
  lastModified: number;
  type: string;
};

/**
 * A job as IndexedDB keeps it until the job ends, so a reload can restore it. `target` is
 * the site's own description of where the job goes, updated as the site's steps finish.
 */
type UploadRecord<T> = {
  id: string;
  site: string;
  label: string;
  title: string;
  target: T;
  /** Null for a job with no file. */
  file: FileFacts | null;
  resume: UploadResume | null;
  steps: UploadStep[];
  createdAt: number;
};

export type { FileFacts, UploadRecord };
