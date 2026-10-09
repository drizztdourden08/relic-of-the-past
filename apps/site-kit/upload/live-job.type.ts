/* @layer site-kit @kind types */
import type { UploadRecord } from './upload-record.type';

type LiveJob<T> = {
  record: UploadRecord<T>;
  file: Blob | null;
  controller: AbortController | null;
  cancelled: boolean;
  stored: Promise<unknown>;
};

export type { LiveJob };
