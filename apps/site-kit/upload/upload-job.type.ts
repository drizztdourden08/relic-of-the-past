/* @layer site-kit @kind types */
type UploadState = 'hashing' | 'uploading' | 'done' | 'failed';

/** One row of the upload list, kept from the drop until dismissed. */
type UploadJob = {
  id: string;
  /** What the row says: the file name, or "v4 of name" for a version. */
  label: string;
  bytes: number;
  /** Bytes the part PUTs have reported so far. */
  sent: number;
  state: UploadState;
  error: string | null;
  /** The record id once the API has created it. */
  fileId: string | null;
};

export type { UploadState, UploadJob };
