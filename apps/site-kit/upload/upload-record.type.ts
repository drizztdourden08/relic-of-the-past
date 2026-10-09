/* @layer site-kit @kind types */
import type { UploadResume, UploadStep } from './upload-job.type';

type FileFacts = {
  name: string;
  size: number;
  lastModified: number;
  type: string;
};

type UploadRecord<T> = {
  id: string;
  site: string;
  label: string;
  title: string;
  target: T;
  file: FileFacts | null;
  resume: UploadResume | null;
  steps: UploadStep[];
  createdAt: number;
};

export type { FileFacts, UploadRecord };
