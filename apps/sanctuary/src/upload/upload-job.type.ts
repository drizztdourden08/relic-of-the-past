/* @layer sanctuary-site @kind types */
import type { FileType } from '@shared/sanctuary/file-types';

/** What the upload dialog asks before the first byte moves; shared by every file of one drop. */
type UploadMeta = {
  type: FileType;
  tags: string[];
  version: string | null;
  note: string;
};

type UploadState = 'hashing' | 'uploading' | 'done' | 'failed';

/** One row of the upload list, kept from the drop until dismissed. */
type UploadJob = {
  id: string;
  name: string;
  bytes: number;
  /** Bytes the part PUTs have reported so far. */
  sent: number;
  state: UploadState;
  error: string | null;
  /** The record id once the API has created it. */
  fileId: string | null;
};

export type { UploadMeta, UploadState, UploadJob };
