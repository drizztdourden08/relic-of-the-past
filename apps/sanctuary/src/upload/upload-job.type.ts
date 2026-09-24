/* @layer sanctuary-site @kind types */
import type { FileType } from '@shared/sanctuary/file-types';

/** What the upload dialog asks before the first byte moves; shared by every file of one drop. */
type UploadMeta = {
  type: FileType;
  tags: string[];
  version: string | null;
  note: string;
};

/** Where an upload lands: a new file, or the next version of one that exists. */
type UploadTarget =
  | { kind: 'new'; meta: UploadMeta }
  | {
    kind: 'version';
    fileId: string;
    /** What changed, one line. */
    note: string;
    /** The file's display name, for the upload row. */
    of: string;
    /** The number the site expects; the API's answer replaces it. */
    next: number;
  };

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

export type { UploadMeta, UploadTarget, UploadState, UploadJob };
